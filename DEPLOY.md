# Ubuntu Server Deployment Guide for Noir

This guide walks you through setting up a fresh Ubuntu server to host the Noir application (Next.js + PostgreSQL).

## 1. System Update & Dependencies

First, update your package lists and install basic utilities:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip build-essential
```

## 2. Install Node.js (v20 LTS recommended)

We'll use NodeSource to install the latest LTS version:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node -v
npm -v
```

## 3. Install & Configure PostgreSQL

Install PostgreSQL:

```bash
sudo apt install -y postgresql postgresql-contrib
```

Start and enable the service:

```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Create User and Database:**

Switch to the postgres user and access the prompt:

```bash
sudo -u postgres psql
```

Inside the `psql` shell, run these commands (change `your_password` to a strong password):

```sql
CREATE DATABASE cosmos;
CREATE USER cosmos_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cosmos TO cosmos_user;
-- Grant schema permissions (important for newer Postgres versions)
\c cosmos
GRANT ALL ON SCHEMA public TO cosmos_user;
\q
```

## 4. Application Setup

**Clone or Copy Project:**

If you are scp-ing your files:
```bash
# On your local machine (adjust path):
# scp -r /Users/ersagun/Projects/cosmos user@your_server_ip:~/cosmos
```

Or just copy the codebase to `~/cosmos`.

**Navigate to directory:**
```bash
cd ~/cosmos
```

**Install Dependencies:**
```bash
npm install
```

**Configure Environment Variables:**

Create a `.env` file:
```bash
nano .env
```

Paste your configuration (adjust with your DB password):

```env
DATABASE_URL="postgresql://cosmos_user:your_password@localhost:5432/cosmos"
JWT_SECRET="your_very_long_secure_random_string_here"
```

Save and exit (`Ctrl+X`, then `Y`, then `Enter`).

**Setup Database Schema:**

Since you don't have migrations, you might need to initialize the tables. You can use the `psql` command with your schema file if you have one, or connect remotely.
Alternatively, ensure your application code automatically creates tables if not exists (checked your code, it seems you use raw SQL queries, make sure tables exist).

If you need to create the table manually, run:

```bash
psql "postgresql://cosmos_user:your_password@localhost:5432/cosmos" -c "
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    src TEXT NOT NULL,
    original_src TEXT,
    cluster TEXT,
    location TEXT,
    sort_order INTEGER DEFAULT 0,
    exif_data JSONB,
    blur_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    name TEXT,
    username TEXT,
    bio TEXT,
    avatar_url TEXT
);
INSERT INTO profile (id, name, username, bio) 
VALUES (1, 'Müge', 'faithme', 'Photographer based in Istanbul') 
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT
);

INSERT INTO admins (username, password_hash, display_name)
VALUES ('kedinur', '$2b$10$1AE6pFEkCnTOKGd39O3sD.PpBhzUcJX9014CpmWW62VRLsvmrVf6G', 'Kedi Nur')
ON CONFLICT DO NOTHING;

"
```

## 5. Build and Run

**Build the application:**

```bash
npm run build
```

**Start with PM2 (Process Manager):**

Install PM2 globally to keep your app running in the background:

```bash
sudo npm install -g pm2
```

Start the app:

```bash
pm2 start npm --name "noir-app" -- start
```

Save PM2 process list and configure to start on boot:

```bash
pm2 save
pm2 startup
# Run the command output by 'pm2 startup'
```

## 6. Setup Nginx (Reverse Proxy) - Recommended

Install Nginx to serve the app on port 80 (HTTP) instead of 3000:

```bash
sudo apt install -y nginx
```

Configure Nginx:

```bash
sudo nano /etc/nginx/sites-available/noir
```

Paste the following configuration (replace `your_domain_or_ip`):

```nginx
server {
    listen 80;
    server_name your_domain_or_ip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size for photos
    client_max_body_size 20M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/noir /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site if exists
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## 7. Firewall

If you have UFW enabled:
```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

Done! Your app should be live at `http://your_domain_or_ip`.
