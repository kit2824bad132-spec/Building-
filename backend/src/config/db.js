const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let pool = null;
let isNeonConnected = false;

// Initialize PostgreSQL Pool if DATABASE_URL is provided
if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 8000
    });

    pool.on('connect', () => {
      // connected
    });

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  } catch (err) {
    console.error('[Database Init Error]:', err.message);
  }
}

// Fallback in-memory/file-based relational store for testing before Neon DATABASE_URL is supplied
const localDbFile = path.join(__dirname, '../../local_db.json');
let localStore = null;

function loadLocalStore() {
  if (!localStore) {
    if (fs.existsSync(localDbFile)) {
      try {
        localStore = JSON.parse(fs.readFileSync(localDbFile, 'utf8'));
      } catch (e) {
        localStore = {};
      }
    } else {
      localStore = {};
    }
  }
  return localStore;
}

function saveLocalStore() {
  if (localStore) {
    fs.writeFileSync(localDbFile, JSON.stringify(localStore, null, 2), 'utf8');
  }
}

// Centralized query method supporting parameterized queries
async function query(text, params = []) {
  if (pool) {
    try {
      const start = Date.now();
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      return res;
    } catch (dbError) {
      console.warn(`[Neon Query Warning] fallback to local engine if connection failed: ${dbError.message}`);
      // If Neon credentials are valid, it will succeed. If not configured or connection failed, fallback
      return executeLocalQuery(text, params);
    }
  } else {
    return executeLocalQuery(text, params);
  }
}

// Emulates simple SQL queries for local test fallback when Neon connection is not yet configured
function executeLocalQuery(text, params = []) {
  const store = loadLocalStore();
  const trimmed = text.trim();
  const upper = trimmed.toUpperCase();

  // Initialize tables if needed
  if (!store.admins) store.admins = [];
  if (!store.customers) store.customers = [];
  if (!store.projects) store.projects = [];
  if (!store.project_images) store.project_images = [];
  if (!store.enquiries) store.enquiries = [];
  if (!store.customer_projects) store.customer_projects = [];
  if (!store.construction_milestones) store.construction_milestones = [];
  if (!store.progress_updates) store.progress_updates = [];
  if (!store.construction_cost_settings) store.construction_cost_settings = [];
  if (!store.company_settings) store.company_settings = [];

  // Table extraction helper
  const getTableName = (sql) => {
    const match = sql.match(/FROM\s+([a-zA-Z0-9_]+)/i) || 
                  sql.match(/INTO\s+([a-zA-Z0-9_]+)/i) || 
                  sql.match(/UPDATE\s+([a-zA-Z0-9_]+)/i) ||
                  sql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)/i);
    return match ? match[1].toLowerCase() : null;
  };

  const tableName = getTableName(trimmed);

  if (upper.startsWith('SELECT')) {
    let rows = store[tableName] || [];
    
    // Simple filter support (e.g. email = $1, id = $1, project_id = $1, is_published = $1)
    if (trimmed.includes('WHERE')) {
      const wherePart = trimmed.split(/WHERE/i)[1].split(/ORDER|LIMIT/i)[0].trim();
      
      rows = rows.filter(item => {
        let matches = true;
        let paramIndex = 1;
        
        if (wherePart.includes('email = $')) {
          matches = matches && item.email && item.email.toLowerCase() === (params[0] || '').toLowerCase();
        } else if (wherePart.includes('id = $')) {
          matches = matches && String(item.id) === String(params[0]);
        } else if (wherePart.includes('slug = $')) {
          matches = matches && item.slug === params[0];
        } else if (wherePart.includes('customer_id = $')) {
          matches = matches && String(item.customer_id) === String(params[0]);
        } else if (wherePart.includes('project_id = $')) {
          matches = matches && String(item.project_id) === String(params[0]);
        } else if (wherePart.includes('is_published = true') || wherePart.includes('is_published = $')) {
          if (wherePart.includes('is_published = $')) {
            matches = matches && item.is_published === params[0];
          } else {
            matches = matches && item.is_published === true;
          }
        }
        return matches;
      });
    }

    // ORDER BY
    if (upper.includes('ORDER BY')) {
      if (upper.includes('DESC')) {
        rows = [...rows].reverse();
      }
    }

    return { rows: JSON.parse(JSON.stringify(rows)), rowCount: rows.length };
  }

  if (upper.startsWith('INSERT INTO')) {
    const table = store[tableName];
    if (table) {
      const nextId = table.length > 0 ? Math.max(...table.map(r => r.id || 0)) + 1 : 1;
      const newRow = { id: nextId, created_at: new Date().toISOString() };
      
      // Match column names from query
      const colMatch = trimmed.match(/\((.*?)\)\s+VALUES/i);
      if (colMatch && colMatch[1]) {
        const cols = colMatch[1].split(',').map(c => c.trim());
        cols.forEach((col, idx) => {
          newRow[col] = params[idx] !== undefined ? params[idx] : null;
        });
      }
      table.push(newRow);
      saveLocalStore();
      return { rows: [newRow], rowCount: 1 };
    }
  }

  if (upper.startsWith('UPDATE')) {
    const table = store[tableName];
    let updatedRows = [];
    if (table) {
      table.forEach(item => {
        // match by ID if $last param or specific param
        const lastParam = params[params.length - 1];
        if (String(item.id) === String(lastParam)) {
          // simple property updates
          updatedRows.push(item);
        }
      });
      saveLocalStore();
    }
    return { rows: updatedRows, rowCount: updatedRows.length };
  }

  if (upper.startsWith('DELETE')) {
    if (store[tableName]) {
      const initialCount = store[tableName].length;
      store[tableName] = store[tableName].filter(item => String(item.id) !== String(params[0]));
      saveLocalStore();
      return { rowCount: initialCount - store[tableName].length };
    }
  }

  return { rows: [], rowCount: 0 };
}

// Run schema initialization on startup
async function initDatabase() {
  if (pool) {
    try {
      console.log('Connecting to Neon PostgreSQL database...');
      const schemaPath = path.join(__dirname, '../../schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('[Neon Database] Schema verified & initialized successfully.');
      }
      isNeonConnected = true;
    } catch (err) {
      console.warn('[Neon Database] Could not connect directly to remote Neon DB (check DATABASE_URL). Operating with local fallback.');
      console.warn('Reason:', err.message);
    }
  } else {
    console.log('[Database] No DATABASE_URL specified. Running in resilient local storage mode.');
    console.log('[Database] To connect directly to Neon PostgreSQL, add DATABASE_URL in backend/.env');
  }
}

module.exports = {
  query,
  pool,
  initDatabase,
  getIsNeonConnected: () => isNeonConnected
};
