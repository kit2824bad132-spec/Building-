-- =====================================================================
-- SARAVANAN BUILDERS — NEON POSTGRESQL PRODUCTION DATABASE SCHEMA
-- =====================================================================

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(150) NOT NULL,
    house_type VARCHAR(100) NOT NULL, -- e.g. 'Luxury Villa', 'Duplex House', 'Independent 3BHK', etc.
    built_up_area_sqft NUMERIC(10, 2) NOT NULL,
    number_of_floors INTEGER DEFAULT 1,
    construction_cost NUMERIC(14, 2) NOT NULL,
    start_date DATE,
    completion_date DATE,
    status VARCHAR(50) DEFAULT 'Ongoing' CHECK (status IN ('Ongoing', 'Completed', 'Upcoming')),
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    main_image_url TEXT NOT NULL,
    main_image_public_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for searching and filtering projects
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(location);
CREATE INDEX IF NOT EXISTS idx_projects_house_type ON projects(house_type);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON projects(is_published);

-- 4. Project Images Table
CREATE TABLE IF NOT EXISTS project_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    public_id VARCHAR(255),
    caption VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);

-- 5. Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    construction_location VARCHAR(150) NOT NULL,
    built_up_area_sqft NUMERIC(10, 2),
    budget_range VARCHAR(100),
    message TEXT NOT NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Quotation Sent', 'Converted', 'Closed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_customer_id ON enquiries(customer_id);

-- 6. Customer Projects (Assignment) Table
CREATE TABLE IF NOT EXISTS customer_projects (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    notes TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_customer_project UNIQUE (customer_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_projects_customer ON customer_projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_projects_project ON customer_projects(project_id);

-- 7. Construction Milestones Table
CREATE TABLE IF NOT EXISTS construction_milestones (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_name VARCHAR(100) NOT NULL,
    stage_order INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    completed_at DATE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON construction_milestones(project_id);

-- 8. Progress Updates Table
CREATE TABLE IF NOT EXISTS progress_updates (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    progress_percentage INTEGER NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    stage_name VARCHAR(100) NOT NULL,
    photos JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs/objects
    update_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_progress_updates_project_id ON progress_updates(project_id);

-- 9. Construction Cost Settings Table
CREATE TABLE IF NOT EXISTS construction_cost_settings (
    id SERIAL PRIMARY KEY,
    quality_tier VARCHAR(50) UNIQUE NOT NULL, -- 'Basic', 'Standard', 'Premium'
    tier_title VARCHAR(100) NOT NULL,
    price_per_sqft NUMERIC(10, 2) NOT NULL,
    description TEXT,
    specifications JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Company Settings Table
CREATE TABLE IF NOT EXISTS company_settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(150) DEFAULT 'Saravanan Builders',
    phone VARCHAR(30) DEFAULT '+91 98400 12345',
    whatsapp_number VARCHAR(30) DEFAULT '919840012345',
    email VARCHAR(150) DEFAULT 'contact@saravananbuilders.com',
    address TEXT DEFAULT '124, Gandhi Road, Anna Nagar, Chennai, Tamil Nadu - 600040',
    working_hours VARCHAR(100) DEFAULT 'Mon - Sat: 9:00 AM - 7:00 PM',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
