# ParkSecure Context De Lucru

Acest fisier pastreaza contextul tehnic al proiectului ParkSecure pentru discutiile si implementarile urmatoare. Se foloseste ca istoric de lucru pentru modulul cloud.

## Scop Proiect

ParkSecure este un sistem inteligent de gestiune a accesului intr-o companie, folosind smartphone, Bluetooth, ESP32, cloud API, PostgreSQL si aplicatie web de administrare.

Proiectul este pentru disciplina Ingineria Programarii, anul 3 AIA, si urmeaza structura:

- Specificatii
- Proiectare
- Implementare
- Testare
- Documentatie
- Management proiect

## Responsabilitatea Modulului Cloud

Partea noastra este doar cloud-ul:

- REST API
- PostgreSQL
- autentificare JWT
- roluri si autorizare
- administrare utilizatori
- administrare divizii
- administrare angajati
- asociere unica angajat-smartphone
- generare seed pentru mobile la inregistrarea dispozitivului
- stocare evenimente de acces
- rapoarte individuale, pe divizie si globale
- documentatie API
- deploy Render

Cloud-ul nu trebuie sa controleze direct poarta si nu trebuie sa faca validarea principala de acces.

## Regula Arhitecturala Principala

Validarea principala a accesului NU se face in cloud.

Flux corect:

```text
Mobile / ESP32 / Poarta
-> valideaza local codul / credentialul
-> decide ALLOWED sau DENIED
-> controleaza poarta
-> trimite evenimentul final catre Cloud API
-> Cloud salveaza evenimentul in PostgreSQL
```

Cloud:

- administreaza datele
- genereaza seed pentru dispozitive
- pastreaza loguri
- genereaza rapoarte
- nu decide principal daca poarta se deschide

Daca apare vreodata endpoint de tip `/api/access/validate`, trebuie tratat ca demo/simulare sau refactorizat, pentru ca poate incalca arhitectura proiectului.

## Stack Tehnic

- Node.js
- Express
- PostgreSQL
- JWT
- bcryptjs
- Docker
- Docker Compose
- Swagger/OpenAPI
- Render

## Repo-Uri Locale

Repo conectat la GitHub:

```text
C:\Users\Potat\Desktop\IS\park-secured-cloud
```

Remote:

```text
https://github.com/ParkSecured/park-secured-cloud.git
```

Repo local fara GitHub:

```text
C:\Users\Potat\Desktop\RepoLocalFaraGitHub\parksecure-backend
```

## GitHub

Pe GitHub exista doar branch-ul:

```text
main
```

Commit-uri vazute:

```text
7662f2e initial cloud modul structure
5da73d0 First Commit
4f44498 Fix
```

Primele doua commit-uri au fost practic schelet/fisiere goale. Codul real este in commit-ul `4f44498`.

Modificarile locale cu `accessSeed` sunt inca locale pana la push.

## URL Deploy

URL cunoscut pentru deploy:

```text
https://park-secured-cloud.onrender.com
```

In documentatie publica sau exemple generice, preferam placeholder:

```text
<RENDER_URL>
```

## Variabile De Mediu

Necesare:

```text
DATABASE_URL
JWT_SECRET
GATE_API_KEY
```

Optional:

```text
DATABASE_SSL=true
PORT
```

Observatie:

- `DATABASE_URL` este verificat in cod.
- `JWT_SECRET` este folosit de auth, dar nu este verificat explicit la pornire.
- `GATE_API_KEY` este folosit pentru poarta/ESP32.
- `render.yaml` nu contine inca `GATE_API_KEY`, deci trebuie adaugat sau setat manual in Render.

## Baza De Date

Schema actuala principala:

- `users`
- `divisions`
- `employees`
- `smartphones`
- `access_events`

### users

Scop:

- autentificare
- rol
- divizie
- activ/inactiv

Campuri:

- `user_id`
- `email`
- `password_hash`
- `role`
- `division_id`
- `is_active`
- `created_at`

Roluri:

- `admin`
- `division_manager`
- `operator`
- `viewer`

### divisions

Campuri:

- `division_id`
- `name`
- `created_at`

### employees

Campuri:

- `employee_id`
- `first_name`
- `last_name`
- `cnp`
- `photo_url`
- `badge_code`
- `division_id`
- `bluetooth_code`
- `car_number`
- `access_start_time`
- `access_end_time`
- `is_active`
- `granted_by_user_id`
- `created_at`
- `updated_at`

### smartphones / devices

In documente apare conceptul `devices`. In cod este implementat prin tabela `smartphones`.

Campuri initiale:

- `smartphone_id`
- `employee_id`
- `platform`
- `device_identifier`
- `is_trusted`
- `registered_at`

Schimbare locala pentru seed:

- `access_seed`

Reguli:

- un angajat are un singur smartphone asociat
- un device identifier este unic
- seed-ul se genereaza in cloud la register/re-register device
- seed-ul apartine dispozitivului, nu angajatului

### access_events

Campuri:

- `event_id`
- `employee_id`
- `smartphone_id`
- `event_type`: `ENTRY` sau `EXIT`
- `event_status`: `ALLOWED` sau `DENIED`
- `event_time`
- `gate_code`
- `source`
- `notes`

Rapoartele se genereaza din `access_events`.

## Endpoint-Uri Existente

Health / docs:

```text
GET /api/health
GET /api/db-test
GET /api/docs
GET /api/docs.json
```

Auth:

```text
POST /api/auth/login
```

Users:

```text
GET /api/users
POST /api/users
```

Divisions:

```text
GET /api/divisions
POST /api/divisions
```

Employees:

```text
GET /api/employees
GET /api/employees/:id
POST /api/employees
PUT /api/employees/:id
PATCH /api/employees/:id/toggle-access
```

Devices / smartphones:

```text
POST /api/devices/register
GET /api/devices/:employeeId
```

Access events:

```text
POST /api/access-events
GET /api/access-events
```

Reports:

```text
GET /api/reports/individual/:employeeId
GET /api/reports/division/:divisionId
GET /api/reports/global
```

Nu exista in codul actual:

```text
POST /api/access/validate
POST /api/access/log
GET /api/gate/status
GET /api/reports/monthly/:id
```

## Format API

Codul activ foloseste payload-uri camelCase, nu snake_case.

Corect:

```json
{
  "employeeId": 1,
  "deviceIdentifier": "android-device-demo-001",
  "eventType": "ENTRY"
}
```

Incorect pentru API-ul actual:

```json
{
  "employee_id": 1,
  "device_identifier": "android-device-demo-001",
  "event_type": "ENTRY"
}
```

Aceasta este o observatie importanta pentru web/mobile si pentru `test-requests.http`.

## Autentificare

Login:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@parksecure.local",
  "password": "admin123"
}
```

Raspuns:

```json
{
  "success": true,
  "data": {
    "token": "<JWT_TOKEN>",
    "user": {
      "userId": 1,
      "email": "admin@parksecure.local",
      "role": "admin",
      "divisionId": null,
      "isActive": true
    }
  }
}
```

Endpoint-uri protejate:

```http
Authorization: Bearer <JWT_TOKEN>
```

Poarta/ESP32:

```http
X-Gate-Api-Key: <GATE_API_KEY>
```

`X-Gate-Api-Key` este acceptat de:

```text
POST /api/access-events
```

## Decizie Despre Seed

Seed-ul trebuie creat cand se adauga/inregistreaza un mobile, adica la:

```text
POST /api/devices/register
```

Motiv:

- seed-ul este credential de dispozitiv
- daca telefonul se schimba, seed-ul trebuie regenerat
- angajatul ramane acelasi, dar telefonul/credentialul se schimba
- respecta asocierea unica angajat-smartphone
- cloud-ul genereaza credentialul, dar nu face validarea principala de acces

Flux dorit:

```text
Web creeaza angajat
-> Web/Mobile inregistreaza telefon
-> Cloud genereaza accessSeed
-> Mobile foloseste accessSeed pentru cod local
-> ESP32 valideaza local
-> ESP32 trimite access event catre cloud
```

Seed-ul trebuie returnat doar la register/re-register, nu la `GET /api/devices/:employeeId`.

## Schimbari Locale Facute Pentru Seed

Atentie: aceste schimbari sunt locale pana la commit/push.

Fisiere modificate local:

- `db/schema.sql`
- `db/migrations/001_add_smartphone_access_seed.sql`
- `src/models/smartphoneModel.js`
- `src/services/deviceService.js`
- `src/docs/openapi.js`
- `README.md`

Comportament implementat local:

- `access_seed VARCHAR(64) NOT NULL UNIQUE` in `smartphones`
- `crypto.randomBytes(32).toString('hex').toUpperCase()`
- `accessSeed` returnat la `POST /api/devices/register`
- `accessSeed` nu este returnat la `GET /api/devices/:employeeId`
- Swagger documenteaza `accessSeed`
- README explica rolul seed-ului si faptul ca ESP32 valideaza local

Migratie locala:

```text
db/migrations/001_add_smartphone_access_seed.sql
```

Pentru baza Render existenta, migratia trebuie rulata inainte de deploy-ul codului cu seed:

```powershell
psql $env:DATABASE_URL -f db/migrations/001_add_smartphone_access_seed.sql
```

Observatie: migratia actuala genereaza seed-uri vechi cu `md5`, deci 32 caractere, in timp ce runtime genereaza 64 caractere. Nu rupe schema, dar este inconsistent.

## Probleme Gasite In Cod

### 1. GATE_API_KEY lipseste din render.yaml

Codul foloseste `process.env.GATE_API_KEY`, dar `render.yaml` nu il declara.

Impact:

- pe Render, `POST /api/access-events` cu `X-Gate-Api-Key` nu functioneaza daca variabila nu este setata manual.

### 2. JWT_SECRET nu este verificat la pornire

`DATABASE_URL` este verificat, dar `JWT_SECRET` nu.

Impact:

- daca lipseste, login-ul poate ajunge la 500.

### 3. Validarea inputului este incompleta

Exemple:

- CNP duplicat ajunge 500
- badge duplicat ajunge 500
- bluetooth duplicat ajunge 500
- role invalid ajunge 500
- divisionId invalid ajunge 500
- eventType invalid ajunge 500
- eventStatus invalid ajunge 500
- deviceIdentifier duplicat poate ajunge 500

Ar trebui mapate la:

- `400 Bad Request`
- `404 Not Found`
- `409 Conflict`

### 4. Access events accepta default-uri prea usor

`createAccessEvent` accepta doar `employeeId` obligatoriu si pune default:

- `eventType = ENTRY`
- `eventStatus = ALLOWED`
- `source = gate`

Pentru demo e comod, dar pentru audit ar fi mai bine ca poarta sa trimita explicit `eventType` si `eventStatus`.

### 5. src/queries pare cod vechi

Fisierele din `src/queries` folosesc denumiri vechi:

- `Users`
- `Employees`
- `AccessEvents`
- `passwordHash`
- `employeeId`

Schema reala foloseste:

- `users`
- `employees`
- `access_events`
- `password_hash`
- `employee_id`

Nu par folosite de runtime, dar pot induce in eroare.

### 6. README nu este complet aliniat cu cerinta stricta de placeholder-uri

README contine URL real:

```text
https://park-secured-cloud.onrender.com
```

Pentru documentatie generica ar trebui folosit:

```text
<RENDER_URL>
```

### 7. Lipseste test-requests.http

Nu exista in repo un fisier `test-requests.http` pentru VS Code REST Client.

### 8. Dockerfile nu copiaza db/

Dockerfile copiaza doar:

```dockerfile
COPY src ./src
```

Pentru runtime este suficient, dar imaginea Docker nu contine `db/schema.sql` sau migratiile. Daca vrem ca documentatia/migratiile sa fie disponibile in container, trebuie copiat si `db`.

## Ce Este Coerent

- Arhitectura cloud este in mare corecta.
- Nu exista validare principala de acces in cloud.
- `POST /api/access-events` suporta JWT sau `X-Gate-Api-Key`.
- Rutele principale exista.
- Rolurile exista si sunt aplicate.
- PostgreSQL este folosit prin `DATABASE_URL`.
- SSL pentru Render este tratat in `src/config/db.js`.
- Parolele sunt hash-uite cu bcrypt.
- JWT are expirare de 8h.
- `users`, `divisions`, `employees`, `smartphones`, `access_events` sunt coerente cu cerintele principale.

## Roluri

Roluri existente:

- `admin`
- `division_manager`
- `operator`
- `viewer`

Reguli curente:

- `admin`: acces global
- `division_manager`, `operator`, `viewer`: filtrare dupa `divisionId`
- `viewer`: citire
- `admin`, `division_manager`, `operator`: write pe employees/devices
- `admin`: creare users si divisions

## Endpoint-uri Si Permisiuni

Public:

- `GET /api/health`
- `GET /api/db-test`
- `GET /api/docs`
- `GET /api/docs.json`
- `POST /api/auth/login`

JWT:

- users
- divisions
- employees
- devices
- reports
- `GET /api/access-events`

JWT sau Gate API Key:

- `POST /api/access-events`

## Teste Rulate

Verificari facute:

```powershell
npm.cmd run check
```

Rezultat:

```text
passed
```

Verificare suplimentara:

```powershell
Get-ChildItem -Path src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Rezultat:

```text
passed
```

Observatie:

- `npm run check` simplu este blocat de PowerShell Execution Policy pe sistemul local.
- `npm.cmd run check` functioneaza.

## Recomandari Urmatori Pasi

1. Discutam si validam seed-ul cu echipa mobile.
2. Aplicam migratia `access_seed` in DB Render.
3. Adaugam `GATE_API_KEY` in `render.yaml` sau manual in Render.
4. Facem commit/push pentru seed dupa confirmare.
5. Adaugam `test-requests.http` cu payload-uri camelCase.
6. Curatam sau marcam `src/queries` ca legacy.
7. Imbunatatim validarea inputului si maparea erorilor DB.
8. Actualizam README cu placeholder-uri si flux complet.
9. Clarificam in documentatie ca `devices` este implementat ca `smartphones`.
10. Optional: adaugam endpoint separat pentru regenerare seed.

## Reguli De Lucru Pentru Viitor

- Nu introduce secrete reale in cod sau README.
- Foloseste placeholder-uri:
  - `<RENDER_URL>`
  - `<DATABASE_URL>`
  - `<JWT_TOKEN>`
  - `<GATE_API_KEY>`
  - `<EXTERNAL_DATABASE_URL>`
  - `<INTERNAL_DATABASE_URL>`
- Nu muta validarea principala de acces in cloud.
- Nu sterge functionalitati fara discutie.
- Cand documentezi request-uri, foloseste camelCase, pentru ca asa este codul actual.
- Cand modifici schema pentru o baza existenta, adauga migratie.
- Pentru verificare locala foloseste `npm.cmd run check`.

## Update 2026-05-21 - Reparatii Probleme Cloud

Au fost reparate problemele cloud identificate anterior, cu exceptia Dockerfile, pe care am decis sa nu il tratam ca problema deoarece aplicatia este hostata.

Schimbari facute:

- `GATE_API_KEY` a fost adaugat in `render.yaml` cu `sync: false`.
- `JWT_SECRET` este verificat la pornirea serverului; lipsa lui opreste aplicatia.
- Lipsa `GATE_API_KEY` produce warning, iar endpoint-ul de access events ramane accesibil cu JWT.
- Erorile PostgreSQL uzuale sunt mapate la raspunsuri API corecte:
  - duplicate: `409 Conflict`
  - foreign key invalid: `404 Not Found`
  - check/format invalid: `400 Bad Request`
- Validarea pentru creare user verifica rolul si `isActive`.
- `POST /api/access-events` cere explicit `employeeId`, `eventType` si `eventStatus`.
- `eventType` accepta doar `ENTRY` sau `EXIT`.
- `eventStatus` accepta doar `ALLOWED` sau `DENIED`.
- Service-ul de access events nu mai pune default pentru `eventType` si `eventStatus`.
- Migrarea `access_seed` genereaza acum seed de 64 caractere si pentru randurile existente.
- README foloseste `<RENDER_URL>` in exemplele Render.
- A fost adaugat `test-requests.http` cu payload-uri camelCase.
- `src/queries` a fost marcat ca legacy prin `src/queries/README.md`.

## Update 2026-05-21 - Sincronizare ESP32/Gate

A fost adaugat endpoint dedicat pentru sincronizarea datelor necesare validarii locale pe ESP32/poarta:

```text
GET /api/gate/access-list
```

Autentificare:

```text
X-Gate-Api-Key: <GATE_API_KEY>
```

Endpoint-ul returneaza:

- angajati activi
- divizie
- cod Bluetooth
- numar masina
- interval orar simplu (`accessStartTime`, `accessEndTime`)
- smartphone trusted
- `accessSeed` pentru validarea locala

Acest endpoint este doar pentru ESP32/gate si nu pentru UI-ul web. Raspunsurile web normale, inclusiv `GET /api/devices/:employeeId`, nu expun `accessSeed`.

Motiv:

- PDF-ul cere comunicare Cloud - Smartphone - ESP32 si validare locala.
- Daca ESP32 valideaza local, are nevoie de o lista sincronizata de credentiale/date active.
- Cloud-ul ramane sursa de configurare si audit, dar nu decide direct deschiderea portii.

Verificari rulate dupa reparatii:

```powershell
npm.cmd run check
```

Rezultat:

```text
passed
```

```powershell
Get-ChildItem -Path src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

Rezultat:

```text
passed
```

De facut inainte de deploy/push:

- Aplicata migrarea `db/migrations/001_add_smartphone_access_seed.sql` in baza Render existenta.
- Setat manual `GATE_API_KEY` in Render.
- Commit si push pentru modificarile locale.

## Update 2026-05-21 - Rol HR

A fost adaugat rolul:

```text
hr
```

Roluri curente:

- `admin`
- `hr`
- `division_manager`
- `operator`
- `viewer`

Reguli implementate:

- `admin` poate crea orice rol.
- `hr` poate crea doar useri cu rol `division_manager`, `operator`, `viewer`.
- `hr` nu poate crea sau modifica useri `admin` sau `hr`.
- `hr` vede lista de useri fara `admin` si fara `hr`.
- `PUT /api/users/:id` permite update pentru `admin` si `hr`, cu restrictiile de mai sus.
- `DELETE /api/admin/users/:id` este doar pentru `admin`.
- `POST /api/employees` este permis pentru `admin` si `hr`.
- `PUT /api/employees/:id` si `PATCH /api/employees/:id/toggle-access` sunt permise pentru `admin`, `hr`, `division_manager`.
- `division_manager` ramane limitat la propria divizie.
- `hr` are acces global la employees/access events/reports, dar fara drepturi distructive de admin.

Schema `users.role` accepta acum:

```text
admin, hr, division_manager, operator, viewer
```

Migratie noua pentru baze existente:

```powershell
psql $env:DATABASE_URL -f db/migrations/002_add_hr_role.sql
```

## Update 2026-05-21 - Validare Demo Access Seed

A fost adaugat endpoint demo:

```text
POST /api/access/validate-seed
```

Autentificare:

```text
X-Gate-Api-Key: <GATE_API_KEY>
```

Body:

```json
{
  "accessSeed": "<ACCESS_SEED>",
  "eventType": "ENTRY",
  "gateCode": "GATE-01"
}
```

Reguli:

- cauta `access_seed` in tabela `smartphones`
- verifica `smartphones.is_trusted = true`
- verifica `employees.is_active = true`
- daca exista `access_start_time` si `access_end_time`, verifica ora curenta in interval
- pentru seed gasit, scrie eveniment in `access_events` cu `ALLOWED` sau `DENIED`
- pentru seed necunoscut, intoarce `DENIED`, dar nu poate scrie rand in `access_events` in schema actuala pentru ca `employee_id` este obligatoriu si nu se cunoaste angajatul

Comportament logare:

- `accessSeed` necunoscut: raspuns `DENIED`, fara rand in `access_events`
- `accessSeed` cunoscut, dar smartphone netrusted: raspuns `DENIED`, cu rand in `access_events`
- `accessSeed` cunoscut, dar angajat inactiv: raspuns `DENIED`, cu rand in `access_events`
- `accessSeed` cunoscut, dar in afara intervalului permis: raspuns `DENIED`, cu rand in `access_events`
- `accessSeed` valid: raspuns `ALLOWED`, cu rand in `access_events`

Observatie:

- Pentru demo se compara seed-ul plain text.
- Pentru productie ar trebui stocat hash-ul seed-ului, nu seed-ul in clar.

## Update 2026-05-21 - Consistenta Smartphone Access Events

`POST /api/access-events` verifica acum daca `smartphoneId` apartine aceluiasi `employeeId`.

Regula:

- daca `smartphoneId` este trimis si apartine angajatului: evenimentul este acceptat
- daca `smartphoneId` este trimis, dar apartine altui angajat sau nu exista: raspuns `400 Bad Request`
- daca `smartphoneId` lipseste: evenimentul poate fi creat doar pe baza `employeeId`

Motiv:

- previne loguri incoerente de forma `employeeId=1` cu `smartphoneId` al altui angajat
- pastreaza rapoartele si auditul coerente

README contine acum sectiunea `Demo flow complet`, cu pasii:

- health
- login
- create division
- create employee
- register smartphone
- validate seed
- list access events
- reports

## Update 2026-05-21 - HR Poate Inregistra Smartphone

Pentru ca fluxul demo sa fie complet si pentru HR:

```text
HR creeaza angajat -> HR inregistreaza smartphone -> se genereaza accessSeed
```

`POST /api/devices/register` permite acum:

- `admin`
- `hr`
- `division_manager`
- `operator`

Motiv:

- HR poate gestiona partea de personal si trebuie sa poata asocia angajatul cu telefonul pentru demo.

## Update 2026-05-21 - Accounts In Loc De Users

Tabela interna `users` a fost redenumita conceptual si in schema finala la `accounts`.

Regula proiectului:

- `accounts` = conturi de autentificare web/cloud, roluri si permisiuni
- `employees` = angajati fizici care intra/ies prin poarta
- un employee poate avea maximum un account
- un account poate avea `employee_id = NULL`
- admin/HR pot exista fara employee asociat

API-ul extern ramane compatibil:

```text
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/admin/users/:id
```

Intern, aceste endpoint-uri citesc/scriu in tabela `accounts`, cu `account_id`.

Coloana din `employees` pentru audit a fost redenumita:

```text
granted_by_user_id -> granted_by_account_id
```
