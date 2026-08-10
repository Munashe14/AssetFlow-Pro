# AssetFlow-Pro

A modern web-based Fixed Asset Management System that helps organizations track assets, manage check-in/check-out, monitor maintenance and repairs, handle disposals, and generate reports — all through a simple, intuitive interface.

Built with **FastAPI** (backend), **React + Vite** (frontend), and **SQLite** (database).

---

## Features

- **Asset tracking** — register, view, and manage the full lifecycle of organizational assets
- **Check-in / Check-out** — assign assets to employees and track their movement
- **Maintenance & repairs** — log and monitor upkeep history per asset
- **Disposal management** — record retired or disposed assets
- **Depreciation tracking** — monitor asset value over time
- **Departments & employees** — organize assets by department and assignee
- **Reports & dashboard** — visual summaries of asset status and activity
- **Notifications** — stay informed of important asset events
- **Audit logs** — track who did what, and when
- **Authentication** — secure login and account creation with role-based access

---

## Tech Stack

| Layer      | Technology                              |
|------------|------------------------------------------|
| Frontend   | React, Vite, React Router                |
| Backend    | FastAPI, SQLAlchemy                      |
| Database   | SQLite                                   |
| Auth       | Token-based (stored in browser)          |

---

## Prerequisites

Before you begin, make sure you have installed:

- **Python 3.10+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** and npm — [nodejs.org](https://nodejs.org/)
- **Git** (optional, for cloning)

---

## Project Structure

```
ASSET_MANAGEMENT/
├── backend/          # FastAPI application (routers, models, schemas)
├── frontend/          # React + Vite application
├── venv/              # Python virtual environment (created during setup)
├── assets.db          # SQLite database file
├── launch-app.bat      # One-click launcher (Windows)
└── README.md
```

---

## First-Time Setup

### 1. Clone or download the project

```bash
git clone https://github.com/Munashe14/AssetFlow-Pro
cd ASSET_MANAGEMENT
```

### 2. Set up the backend

From the project root:

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate      # macOS/Linux

pip install -r backend/requirements.txt
```

### 3. Set up the frontend

```bash
cd frontend
npm install
cd ..
```

---

## Running the App

### Option A — One-click launch (Windows)

Double-click **`launch-app.bat`** in the project root. It will:

1. Start the FastAPI backend at `http://localhost:8000`
2. Start the React frontend at `http://localhost:5173`
3. Open the app in your default browser automatically

Two terminal windows will open — one for each server. Close them to stop the app.

### Option B — Manual start

**Backend** (from the project root, with `venv` activated):
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend** (from the `frontend/` folder, in a separate terminal):
```bash
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## Using the App

1. **Create an account** — on first use, go to the "Create Account" page to register a user.
2. **Log in** — sign in with your credentials to access the dashboard.
3. **Dashboard** — get an overview of asset counts, statuses, and recent activity.
4. **Assets** — add, edit, and view detailed asset records.
5. **Checkouts** — assign assets to employees and check them back in when returned.
6. **Maintenance / Repairs** — log service history against any asset.
7. **Disposal** — retire assets that are no longer in use.
8. **Depreciation** — track how asset value changes over time.
9. **Reports** — generate summaries for review or export.
10. **Departments / Users** — manage organizational structure and user accounts.
11. **Notifications** — check alerts relevant to asset status or actions.

---

## API Health Check

Once the backend is running, verify it's up at:

```
http://localhost:8000/health
```

Interactive API documentation (Swagger UI) is available at:

```
http://localhost:8000/docs
```

---

## Troubleshooting

| Issue | Likely Cause | Fix |
|---|---|---|
| `ModuleNotFoundError` or relative import error | Backend started from inside `backend/` instead of project root | Run `uvicorn backend.main:app` from the project root, not `backend/` |
| Frontend can't reach backend | Backend not running, or wrong port | Confirm backend is live at `http://localhost:8000/health` |
| `venv\Scripts\activate` not found | Virtual environment not created yet | Run `python -m venv venv` from the project root |
| Port already in use | A previous server instance is still running | Close existing terminal windows or kill the process using that port |

---

## License

Internal project — license terms as determined by the project owner.