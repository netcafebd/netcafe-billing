# ISP Billing Management System - cPanel Deployment Guide

This guide provides step-by-step instructions for deploying the ISP Billing Management System on **cPanel-based shared hosting (such as Putul Host)** utilizing **"Setup Node.js App" (Phusion Passenger)** and **cPanel PostgreSQL**.

---

## 1. Hosting Environment & Architecture Overview

* **Hosting Platform:** Putul Host (CloudLinux / cPanel)
* **Application Engine:** Setup Node.js App (Phusion Passenger)
* **Runtime:** Node.js `24.x` (e.g. `24.20.0`)
* **Database:** PostgreSQL (managed via cPanel PostgreSQL Database Wizard / phpPgAdmin)
* **Application Framework:** Next.js 15 (App Router, Standalone mode)
* **Startup File:** Root `server.js` (Passenger-compatible entry point)
* **Requirements:** **NO** Docker, **NO** VPS, **NO** PM2, **NO** Redis, **NO** root access required.

---

## 2. Step-by-Step Deployment Instructions

### Step 1: Create the PostgreSQL Database & User in cPanel

1. Log into your **cPanel**.
2. Under the **Databases** section, click **PostgreSQL Database Wizard** (or **PostgreSQL Databases**).
3. **Create Database:**
   * Enter a database name (e.g., `ispbilling`).
   * *Note:* cPanel will automatically prefix this with your cPanel username (e.g., `nipuntop_ispbilling`).
   * Click **Next Step**.
4. **Create Database User:**
   * Enter a username (e.g., `ispuser`).
   * *Note:* cPanel will prefix this as well (e.g., `nipuntop_ispuser`).
   * Generate a strong, secure password and copy it to a safe place.
   * Click **Create User**.
5. **Assign User Privileges:**
   * Check **ALL PRIVILEGES** for this user on the new database.
   * Click **Make Changes**.

---

### Step 2: Configure Domain / Subdomain

1. In cPanel, go to **Domains** -> **Domains** (or **Subdomains**).
2. Create your subdomain (e.g., `billing.nipun.top`).
3. Note the document root directory cPanel assigns (e.g., `/home/username/billing.nipun.top` or `/home/username/public_html/billing`).

---

### Step 3: Create the Node.js Application in cPanel

1. In cPanel, under **Software**, click **Setup Node.js App**.
2. Click the **Create Application** button.
3. Configure the following fields:
   * **Node.js version:** Select **24.20.0** (or the latest 24.x version available).
   * **Application mode:** Select **Production**.
   * **Application root:** Enter your desired application folder name, e.g., `isp-billing` (located inside your home directory `/home/username/isp-billing`).
   * **Application URL:** Select your domain/subdomain from the dropdown (e.g., `billing.nipun.top`).
   * **Application startup file:** Enter `server.js`.
4. Click **Create**.
5. At the top of the page, cPanel will display a command to enter the virtual environment, for example:
   ```bash
   source /home/username/nodevenv/isp-billing/24/bin/activate && cd /home/username/isp-billing
   ```
   *(Keep this command handy if using Terminal).*

---

### Step 4: Configure Environment Variables

Scroll down to the **Environment variables** section inside the Node.js application settings in cPanel, and click **Add Variable** for each of the following:

| Variable Name | Value Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | Full PostgreSQL connection URI | `postgresql://cpaneluser_ispuser:YourStrongPassword@localhost:5432/cpaneluser_ispbilling?schema=public` |
| `AUTH_SECRET` | 32+ character random string | `e8f5c3b29a1d4e7f602b8a4c1e9d3f5a7c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0` |
| `NODE_ENV` | Must be `production` | `production` |

> [!TIP]
> Alternatively, you can create a `.env` file directly inside your **Application root** (`/home/username/isp-billing/.env`) containing these variables.

---

### Step 5: Upload Application Files

You have two convenient options to deploy the code:

#### Option A: Deploy Source & Build on Server (Recommended if you have cPanel Terminal)
1. Compress your project into a `.zip` file on your computer, **excluding**:
   * `node_modules/`
   * `.git/`
   * `.next/`
2. In cPanel, open **File Manager**, navigate to your Application root (`/home/username/isp-billing/`), and upload the `.zip` file.
3. Extract the contents directly into `/home/username/isp-billing/`.
4. Open **Terminal** in cPanel.
5. Activate the Node.js virtual environment:
   ```bash
   source /home/username/nodevenv/isp-billing/24/bin/activate && cd /home/username/isp-billing
   ```
6. Run the automated deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```
   *(This installs dependencies, generates Prisma client, deploys migrations, builds the standalone app, and restarts Passenger).*

#### Option B: Build Locally on PC and Upload Pre-Bundled Package (Best for strict RAM limits)
If your shared hosting plan has strict RAM limits that kill the Next.js compiler during build:
1. Build locally on your computer:
   ```bash
   npm run build
   ```
2. Your local build will generate the `.next/standalone/` folder with static files pre-copied.
3. Upload the project files along with the generated `.next/` directory to `/home/username/isp-billing/`.
4. In cPanel Terminal:
   ```bash
   source /home/username/nodevenv/isp-billing/24/bin/activate && cd /home/username/isp-billing
   npm install --omit=dev
   npx prisma migrate deploy
   ```

---

### Step 6: Initial Database Migration & Seeding (First-Time Only)

When deploying for the first time, apply the PostgreSQL schema and seed the initial administrator and sample data:

In cPanel Terminal:
```bash
# 1. Apply database migrations to PostgreSQL
npx prisma migrate deploy

# 2. Seed initial admin user and default settings
npx tsx prisma/seed.ts
```

**Default Admin Credentials:**
* **Email:** `admin@example.com`
* **Password:** `admin123`

*(Change the administrator password immediately after first login in Admin Settings).*

---

### Step 7: Restart the Application

Whenever you make code or environment variable changes:
* In cPanel **Setup Node.js App**, click the **Restart** button at the top right.
* Or in Terminal, run:
  ```bash
  mkdir -p tmp && touch tmp/restart.txt
  ```

Visit your domain (e.g. `https://billing.nipun.top`) to test and verify the live system.

---

## 3. Maintenance & Troubleshooting

### 1. Phusion Passenger Error / 503 Service Unavailable
* Check the application error logs located inside your application root:
  * `stderr.log`
  * `passenger.log`
* Ensure `server.js` exists in the application root.

### 2. Database Connection Errors (`P1001: Can't reach database server`)
* Verify your PostgreSQL credentials in phpPgAdmin.
* Ensure the database name and username include the cPanel prefix (`<cpaneluser>_<dbname>`).
* Verify the port is `5432` and host is `localhost` (or `127.0.0.1`).

### 3. Static Files (CSS/Images) Not Loading
* The automated post-build script (`scripts/postbuild.js`) automatically copies `.next/static` to `.next/standalone/.next/static`. If CSS appears unstyled after manual edits, re-run `npm run postbuild` or `./deploy.sh`.

