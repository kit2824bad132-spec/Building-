const bcrypt = require('bcryptjs');
const db = require('../config/db');
require('dotenv').config();

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || 'admin@saravananbuilders.com').toLowerCase().trim();
  const password = args[1] || 'Saravanan@2026';
  const fullName = args[2] || 'Saravanan (Managing Director)';

  console.log('--- Admin Account Setup ---');
  console.log(`Email: ${email}`);
  console.log(`Full Name: ${fullName}`);

  try {
    const existing = await db.query('SELECT id FROM admins WHERE email = $1', [email]);
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existing.rows.length > 0) {
      await db.query(
        'UPDATE admins SET password_hash = $1, full_name = $2, updated_at = NOW() WHERE email = $3',
        [passwordHash, fullName, email]
      );
      console.log('✅ Existing admin password & details updated successfully!');
    } else {
      await db.query(
        `INSERT INTO admins (full_name, email, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, 'admin', NOW(), NOW())`,
        [fullName, email, passwordHash]
      );
      console.log('✅ Admin created successfully!');
    }

    console.log(`\nYou can now log in at the admin portal with:`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to create admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
