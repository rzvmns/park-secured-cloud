# ParkSecure Backend

Backend REST pentru modulul cloud ParkSecure: utilizatori si roluri, angajati,
asociere unica angajat-smartphone, evenimente de acces si rapoarte.

## Database

The backend uses PostgreSQL. Create the schema with:

```powershell
psql $env:DATABASE_URL -f db/schema.sql
```

If the database already exists from an older version, apply migrations in order:

```powershell
psql $env:DATABASE_URL -f db/migrations/001_add_smartphone_access_seed.sql
psql $env:DATABASE_URL -f db/migrations/002_add_hr_role.sql
```

Initial admin account:

```text
email: admin@parksecure.local
password: admin123
```

Change this password after first login in a real deployment.

Optional demo HR account:

```text
email: hr@parksecure.local
password: admin123
```

For an existing database, create or repair the demo HR account with:

```sql
INSERT INTO users (email, password_hash, role, division_id, is_active)
VALUES (
  'hr@parksecure.local',
  '$2b$10$2rQU5Drt6QyImytbWglMQ.opIMPH36dK7bpRSO5g87dWzRHLtJB.m',
  'hr',
  NULL,
  TRUE
)
ON CONFLICT (email) DO UPDATE SET
  role = 'hr',
  division_id = NULL,
  is_active = TRUE;
```

The demo password hash above is for `admin123`; change this password in a real deployment.

## Main API endpoints

```text
POST /api/auth/login
GET  /api/users
POST /api/users
PUT  /api/users/:id
DELETE /api/admin/users/:id
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
GET  /api/gate/access-list
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

## Roles and permissions

```text
admin
hr
division_manager
operator
viewer
```

`admin` can manage the whole system, including divisions, users, employees, permanent deletes and global reports.

`hr` can manage personnel and ordinary web users:

- create users with role `division_manager`, `operator` or `viewer`
- update users that are not `admin` or `hr`
- add and update employees
- associate employees with divisions
- activate or deactivate employee access
- view personnel reports

`hr` cannot create or modify `admin`/`hr` users and cannot permanently delete data.

`division_manager` can view and update employees only inside their own division.

`operator` can view employees and logs and can create access events where allowed.

`viewer` has read-only access.

## Demo requests on Render

Base URL:

```text
<RENDER_URL>
```

First, verify that the backend and PostgreSQL connection are working:

```http
GET <RENDER_URL>/api/health
```

```http
GET <RENDER_URL>/api/db-test
```

Log in with the initial admin account and copy the JWT token from the response:

```http
POST <RENDER_URL>/api/auth/login
Content-Type: application/json

{
  "email": "admin@parksecure.local",
  "password": "admin123"
}
```

Or log in with the demo HR account:

```http
POST <RENDER_URL>/api/auth/login
Content-Type: application/json

{
  "email": "hr@parksecure.local",
  "password": "admin123"
}
```

HR can use the returned token to create/update employees and manage ordinary users (`division_manager`, `operator`, `viewer`), but cannot create admin/hr users or permanently delete data.

Use the token on protected endpoints:

```text
Authorization: Bearer <TOKEN>
```

Create a division:

```http
POST <RENDER_URL>/api/divisions
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "name": "Demo Security"
}
```

List divisions:

```http
GET <RENDER_URL>/api/divisions
Authorization: Bearer <TOKEN>
```

Create an employee. Replace the `divisionId` value with the ID returned by the division request:

```http
POST <RENDER_URL>/api/employees
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "firstName": "Andrei",
  "lastName": "Popescu",
  "cnp": "1990101123456",
  "photoUrl": "https://example.com/andrei-popescu.jpg",
  "badgeCode": "BADGE-DEMO-001",
  "divisionId": 1,
  "bluetoothCode": "BT-DEMO-001",
  "carNumber": "B123DEM",
  "accessStartTime": "08:00",
  "accessEndTime": "18:00",
  "isActive": true
}
```

List employees:

```http
GET <RENDER_URL>/api/employees
Authorization: Bearer <TOKEN>
```

Register a smartphone/device. Replace the `employeeId` value with the ID returned by the employee request.
When a device is registered or re-registered, the cloud generates a new `accessSeed` for the mobile app:

```http
POST <RENDER_URL>/api/devices/register
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "employeeId": 1,
  "platform": "android",
  "deviceIdentifier": "android-demo-device-001",
  "isTrusted": true
}
```

Example response:

```json
{
  "success": true,
  "data": {
    "smartphoneId": 1,
    "employeeId": 1,
    "platform": "android",
    "deviceIdentifier": "android-demo-device-001",
    "accessSeed": "4D7C4F6F1B2A4E6D8C9A0B1C2D3E4F506172839405A6B7C8D9E0F11223344556",
    "isTrusted": true,
    "registeredAt": "2026-05-20T10:00:00.000Z"
  }
}
```

`accessSeed` is a secret generated by the cloud for the registered smartphone.
Mobile uses it to generate the entry code locally. The ESP32/gate should validate
that code locally and then send the final access event to the cloud. The cloud
does not make the main ALLOWED/DENIED access decision.

Check the registered device:

```http
GET <RENDER_URL>/api/devices/<employeeId>
Authorization: Bearer <TOKEN>
```

The `GET /api/devices/<employeeId>` response does not return `accessSeed`.
The seed is returned only when the device is registered or re-registered.

Create an access event after the ESP32/gate has made the local access decision.
Replace the `employeeId` and `smartphoneId` values with the IDs returned by the previous requests:

```http
POST <RENDER_URL>/api/access-events
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "employeeId": 1,
  "smartphoneId": 1,
  "eventType": "ENTRY",
  "eventStatus": "ALLOWED",
  "gateCode": "GATE-01",
  "source": "web-demo",
  "notes": "Demo access event"
}
```

List access events:

```http
GET <RENDER_URL>/api/access-events
Authorization: Bearer <TOKEN>
```

Synchronize active access data for ESP32/gate local validation:

```http
GET <RENDER_URL>/api/gate/access-list
X-Gate-Api-Key: <GATE_API_KEY>
```

This endpoint returns active employees, access intervals, Bluetooth codes, trusted smartphone metadata and `accessSeed`.
It is intended only for the gate/ESP32 sync flow, not for the web UI.

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
GATE_API_KEY
```

`JWT_SECRET` is generated automatically by Render. `GATE_API_KEY` must be set manually and used by the ESP32/gate when sending access events.

After deploy, test:

```text
<RENDER_URL>/api/health
```
