# ParkSecure Backend

Backend REST pentru modulul cloud ParkSecure: utilizatori si roluri, angajati,
asociere unica angajat-smartphone, evenimente de acces si rapoarte.

## Database

The backend uses PostgreSQL. Create the schema with:

```powershell
psql $env:DATABASE_URL -f db/schema.sql
```

Initial admin account:

```text
email: admin@parksecure.local
password: admin123
```

Change this password after first login in a real deployment.

## Main API endpoints

```text
POST /api/auth/login
GET  /api/users
POST /api/users
GET  /api/divisions
POST /api/divisions
GET  /api/employees
GET  /api/employees/:id
POST /api/employees
PUT  /api/employees/:id
PATCH /api/employees/:id/toggle-access
POST /api/devices/register
GET  /api/devices/:employeeId
POST /api/access-events
GET  /api/access-events
GET  /api/reports/individual/:employeeId
GET  /api/reports/division/:divisionId
GET  /api/reports/global
```

Protected web endpoints require:

```text
Authorization: Bearer <jwt>
```

The gate/ESP32 can send access events using:

```text
X-Gate-Api-Key: <GATE_API_KEY>
```

## Run with Docker

1. Start Docker Desktop.
2. Make sure `.env` exists in this folder and contains `JWT_SECRET` and `GATE_API_KEY`.
3. Build and start the backend:

```powershell
docker compose up --build
```

The API will be available at:

```text
http://localhost:3000/api/health
```

Swagger UI will be available at:

```text
http://localhost:3000/api/docs
```

The OpenAPI JSON document is available at:

```text
http://localhost:3000/api/docs.json
```

Docker Compose also starts a local PostgreSQL container and loads `db/schema.sql`
the first time the database volume is created.

To run it in the background:

```powershell
docker compose up --build -d
```

Useful commands:

```powershell
docker compose logs -f
docker compose down
```

If port `3000` is already used on Windows, set another host port before starting:

```powershell
$env:HOST_PORT="3001"
docker compose up --build
```

Then open:

```text
http://localhost:3001/api/health
```

## Upload to GitHub

Create an empty GitHub repository, then run these commands in this folder:

```powershell
git init
git add .
git commit -m "Prepare ParkSecure backend for Docker and Render"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Do not commit `.env`. It contains local secrets and is already ignored by Git.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, create a new Blueprint or Web Service from the GitHub repo.
3. If using the Blueprint flow, Render reads `render.yaml`.
4. Add the requested environment variable value from your Render PostgreSQL database:

```text
DATABASE_URL
```

`JWT_SECRET` is generated automatically by Render.

After deploy, test:

```text
https://YOUR_RENDER_SERVICE.onrender.com/api/health
```
