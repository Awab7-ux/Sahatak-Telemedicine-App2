# Sahatak Backend (Flask + PostgreSQL)

REST API backing the Sahatak telemedicine frontend: auth, doctors, appointments,
medical records, pharmacy/cart, clinics, notifications, and chat.

## Stack
- Flask + Flask-SQLAlchemy (ORM)
- PostgreSQL
- Flask-Migrate (Alembic) for schema migrations
- Flask-JWT-Extended for authentication
- Flask-Cors for the React frontend

## Option A — Run with Docker (recommended)

From the project root:

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

This starts PostgreSQL on `localhost:5432` and the API on `http://localhost:5000`.
Then, in a separate terminal, run the migrations and seed data:

```bash
docker compose exec backend flask db upgrade
docker compose exec backend python seed.py
```

## Option B — Run locally without Docker

1. Install PostgreSQL locally and create a database + user matching `.env`:

```sql
CREATE USER sahatak_user WITH PASSWORD 'sahatak_pass';
CREATE DATABASE sahatak_db OWNER sahatak_user;
```

2. Set up the Python environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
```

3. Initialize the database and run migrations:

```bash
flask --app run db init
flask --app run db migrate -m "Initial schema"
flask --app run db upgrade
python seed.py
```

4. Run the server:

```bash
python run.py
```

The API will be available at `http://localhost:5000/api`.

## Connecting the frontend

Point the React app to `http://localhost:5000/api` as the API base URL
(e.g. via a `VITE_API_URL` env var in the frontend's `.env`), and replace the
mock-data calls in `src/context/AppContext.tsx` with real `fetch`/`axios`
calls to these endpoints.

## API Overview

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Doctors | `GET /api/doctors`, `GET /api/doctors/<id>`, `GET /api/doctors/categories` |
| Appointments | `GET/POST /api/appointments`, `PATCH /api/appointments/<id>` |
| Medical Records | `GET /api/medical-records`, `GET /api/medical-records/<id>` |
| Pharmacy | `GET /api/products`, `GET /api/products/<id>`, `GET /api/checkup-packages` |
| Cart | `GET/POST /api/cart`, `PATCH/DELETE /api/cart/<product_id>` |
| Clinics | `GET /api/clinics`, `GET /api/clinics/<id>` |
| Notifications | `GET /api/notifications`, `PATCH /api/notifications/<id>/read` |
| Chat | `GET/POST /api/chat/<doctor_id>` |
| Profile | `GET/PATCH /api/profile` |

All endpoints except auth, doctors, products, checkup-packages, and clinics
require a `Authorization: Bearer <token>` header (token returned from
register/login).
