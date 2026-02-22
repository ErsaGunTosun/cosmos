-- Categories
CREATE TABLE IF NOT EXISTS clusters (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,      
    description TEXT                
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,             
    district TEXT,                  
    description TEXT,               
    UNIQUE NULLS NOT DISTINCT (name, district) 
);

-- Profile
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    name TEXT,
    username TEXT,
    bio TEXT,
    avatar_url TEXT
);

-- Admins
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT
);

-- Photos
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    src TEXT NOT NULL,
    original_src TEXT,
    description TEXT,                                                  
    cluster_id INTEGER REFERENCES clusters(id) ON DELETE SET NULL,
    location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL,
    admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,         
    sort_order INTEGER DEFAULT 0,
    exif_data JSONB,
    blur_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Data
INSERT INTO profile (id, name, username, bio) 
VALUES (1, 'Kedi Nur', 'kedinur', 'KEDİLERİN EN GÜZELİ') 
ON CONFLICT DO NOTHING;
