# Hantavirus Tracker 2026

This project uses a split architecture with a **Static Frontend (SolidJS + Vite)** and a **PocketBase (Go) Backend/Database**.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PocketBase binary for your platform

### 1. Download PocketBase
Download the latest PocketBase binary for your platform from
[GitHub Releases](https://github.com/pocketbase/pocketbase/releases).

Extract the `pocketbase` executable into the `backend/` directory.

### 2. Start the backend
```bash
./start_backend.sh
```

On first run, PocketBase will prompt you to create a superuser account at
[http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/).

### 3. Install dependencies and start the frontend
```bash
npm install
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Optional: Custom PocketBase URL
If your PocketBase is not running at the default URL, copy `.env.example` to `.env`
and adjust `VITE_POCKETBASE_URL`.

---

## Deployment (Shared Hosting / cPanel)

Since it is hosted on a shared hosting environment (cPanel), the configuration has certain requirements for both to coexist correctly under the same domain.

### Important URLs

* **Website (Frontend):** [https://hantavirus.iagovar.com](https://hantavirus.iagovar.com)
* **Admin Panel (Database):** [https://hantavirus.iagovar.com/_/](https://hantavirus.iagovar.com/_/) — Access here to create tables, view records, and manage PocketBase permissions.
* **API Entry Point:** `https://hantavirus.iagovar.com/api`
* **API Health Check:** [https://hantavirus.iagovar.com/api/health](https://hantavirus.iagovar.com/api/health)

> **Note:** All traffic going to `/api` or `/_/` is intercepted by the `.htaccess` file and transparently forwarded to the PocketBase background process.

---

## Build the Frontend (Deployment)
Vite and SolidJS compile the code into static files (HTML/JS/CSS).

To compile and publish the latest changes, use the command defined in `package.json`:
```bash
npm run deploy
```
*This runs the build and copies the contents of `dist/` to the root of your domain.*

---

## Backend (PocketBase)

PocketBase is a binary file written in Go located inside the hidden `backend/` folder.

To launch it just run the `start_backend.sh` script. It will run the pocketbase binary on port 60123.

### CloudLinux shared workaround

Current CloudLinux enviroment will kill pocket base on certain circunstances, to prevent this from happening run a cron job every T.

```bash
/home/$USER/public_html/hantavirus.iagovar.com/start_backend.sh
```

### Database files
All data, table schemas, and PocketBase settings are automatically saved in the `backend/pb_data/` folder. This folder is protected by an internal `.htaccess` to prevent unauthorized web access. To back up your database, simply download that folder.
