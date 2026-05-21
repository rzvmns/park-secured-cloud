# ParkSecure Web Handoff

Acest document este pentru colegul care face partea web/frontend. El explica logica aplicatiei, ce cere tema din PDF si cum trebuie consumat backend-ul.

## Ce cere tema

Tema este un sistem de gestiune a accesului intr-o companie. Sistemul tine evidenta prezentei personalului si valideaza intrari/iesiri printr-un flux cu smartphone, Bluetooth, ESP32, poarta si cloud.

Modulele din tema:

- aplicatie la poarta, pe laptop/PC
- modul ESP32 cu Wi-Fi, Bluetooth, LED-uri, bariere lumina si motor/servo
- aplicatie smartphone pentru solicitarea accesului
- componenta cloud/web pentru administrare, personal, loguri si rapoarte

Partea web/cloud trebuie sa acopere:

- evidenta utilizatorilor autorizati
- evidenta angajatilor
- asocierea unica angajat-smartphone
- administrarea intervalelor orare de acces
- activare/dezactivare acces
- urmarirea prezentei prin ore de intrare/iesire
- rapoarte individuale, pe divizie si globale
- loguri de acces in functie de rol

## Concepte din backend

### accounts

`accounts` sunt conturile care se pot autentifica in aplicatia web/cloud.

Exemple:

- admin
- hr
- division_manager
- operator
- viewer

Campuri utile pentru web:

```text
accountId
email
role
divisionId
employeeId
isActive
createdAt
```

Endpoint-urile externe raman `/api/users`, desi tabela interna se numeste `accounts`.

### employees

`employees` sunt angajatii fizici care pot intra/iesi pe poarta.

Campuri utile:

```text
employeeId
firstName
lastName
cnp
photoUrl
badgeCode
divisionId
divisionName
bluetoothCode
carNumber
accessStartTime
accessEndTime
isActive
grantedByAccountId
createdAt
updatedAt
```

Reguli:

- un employee poate avea maximum un account
- un account poate avea `employeeId = null`
- un employee are maximum un smartphone
- admin/HR pot exista fara employee asociat

### smartphones

`smartphones` reprezinta telefonul asociat unui angajat.

Campuri utile:

```text
smartphoneId
employeeId
platform
deviceIdentifier
isTrusted
registeredAt
```

La register, backend-ul returneaza `accessSeed`. Dupa aceea, seed-ul nu se mai returneaza la `GET /api/devices/:employeeId`.

### access_events

`access_events` sunt logurile de intrare/iesire.

Campuri utile:

```text
eventId
employeeId
smartphoneId
eventType      ENTRY | EXIT
eventStatus    ALLOWED | DENIED
eventTime
gateCode
source
notes
```

## Roluri si UI

### admin

Adminul vede si poate modifica tot:

- accounts
- divisions
- employees
- smartphones
- access logs
- reports
- delete permanent unde exista endpoint

### hr

HR gestioneaza personalul si conturi obisnuite:

- poate crea/modifica employees
- poate crea accounts cu rol `division_manager`, `operator`, `viewer`
- poate activa/dezactiva accesul angajatilor
- poate vedea rapoarte de personal

HR nu poate:

- crea/modifica admin
- crea/modifica HR
- sterge definitiv conturi/date

### division_manager

Vede si modifica doar angajatii din divizia lui. Rapoartele trebuie filtrate la divizia lui.

### operator

Vede angajati/loguri si poate introduce/verifica evenimente de acces unde este permis.

### viewer

Doar citire.

## Ecrane recomandate pentru web

PDF-ul cere componenta cloud pentru administrare, prezenta si rapoarte. Web-ul ar trebui sa aiba minimum aceste ecrane:

### 1. Login

Endpoint:

```http
POST /api/auth/login
```

Request:

```json
{
  "email": "admin@parksecure.local",
  "password": "admin123"
}
```

Frontend-ul salveaza tokenul si il trimite pe endpoint-urile protejate:

```text
Authorization: Bearer <TOKEN>
```

### 2. Dashboard

Ar trebui sa arate rapid:

- total angajati
- angajati activi/inactivi
- ultimele access events
- intrari/iesiri recente
- denied events recente
- status general demo

Datele pot veni din:

```text
GET /api/access-events
GET /api/reports/global
GET /api/employees
```

### 3. Employees

Functionalitati:

- lista angajati
- creare angajat
- editare angajat
- activare/dezactivare acces
- filtrare dupa divizie
- afisare `photoUrl`, masina, badge, bluetooth code, interval orar

Endpoint-uri:

```text
GET   /api/employees
GET   /api/employees/:id
POST  /api/employees
PUT   /api/employees/:id
PATCH /api/employees/:id/toggle-access
```

Campuri obligatorii la creare:

```json
{
  "firstName": "Ana",
  "lastName": "Popescu",
  "cnp": "2990101000001",
  "divisionId": 3
}
```

Campuri optionale importante:

```json
{
  "photoUrl": "https://example.com/ana.jpg",
  "badgeCode": "DEMO-BADGE-001",
  "bluetoothCode": "BT-DEMO-ANA-001",
  "carNumber": "TM01ANA",
  "accessStartTime": "08:00",
  "accessEndTime": "18:00",
  "isActive": true
}
```

### 4. Accounts

In UI se poate numi "Accounts" sau "User accounts". Endpoint-ul ramane `/api/users`.

Functionalitati:

- lista conturi
- creare cont
- editare cont
- dezactivare cont prin `isActive=false`
- stergere permanenta doar pentru admin
- asociere optionala account -> employee

Endpoint-uri:

```text
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/admin/users/:id
```

Create account:

```json
{
  "email": "viewer.demo@parksecure.local",
  "password": "admin123",
  "role": "viewer",
  "divisionId": 4,
  "employeeId": 7,
  "isActive": true
}
```

Validari de afisat in UI:

- HR nu poate crea `admin` sau `hr`
- `division_manager`, `operator`, `viewer` au nevoie de `divisionId`
- daca employee-ul are deja account, backend-ul intoarce 409
- daca email-ul exista deja, backend-ul intoarce 409

### 5. Divisions

Endpoint-uri:

```text
GET  /api/divisions
POST /api/divisions
```

Create:

```json
{
  "name": "Demo Security"
}
```

### 6. Smartphone / Device

PDF-ul cere asociere unica angajat-smartphone. Web-ul trebuie sa permita macar:

- vizualizarea telefonului asociat unui employee
- register/re-register smartphone pentru un employee
- afisarea starii `isTrusted`

Endpoint-uri:

```text
POST /api/devices/register
GET  /api/devices/:employeeId
```

Register:

```json
{
  "employeeId": 7,
  "platform": "ios",
  "deviceIdentifier": "ios-demo-device-001",
  "isTrusted": true
}
```

Atentie: `accessSeed` apare doar in raspunsul de register/re-register.

### 7. Access logs

PDF-ul cere vizualizarea intrarilor/iesirilor si logurilor de acces.

Endpoint:

```text
GET /api/access-events
```

Filtre utile:

```text
employeeId
divisionId
eventType
from
to
```

UI recomandat:

- tabel cu data/ora, employee, eventType, status, gateCode, source, notes
- badge verde pentru `ALLOWED`
- badge rosu pentru `DENIED`
- filtre pe perioada si divizie

### 8. Reports

PDF-ul cere rapoarte individuale, pe divizii si globale.

Endpoint-uri:

```text
GET /api/reports/individual/:employeeId
GET /api/reports/division/:divisionId
GET /api/reports/global
```

UI recomandat:

- raport individual: prezenta angajatului, intrari/iesiri, denied events
- raport divizie: total angajati, events pe divizie
- raport global: toate diviziile

### 9. Gate / ESP32 demo status

PDF-ul mentioneaza poarta, stari si LED-uri:

- inchis
- deschis
- in curs de deschidere
- in curs de inchidere
- LED galben: sistem pornit/conectat
- LED verde: acces permis
- LED rosu: acces respins
- LED albastru: motor poarta activ

Backend-ul cloud nu controleaza direct poarta in UI, dar web-ul poate avea o pagina demo care explica/afiseaza ultimul status pe baza ultimelor `access_events`.

Pentru ESP32/gate exista:

```text
GET /api/gate/access-list
POST /api/access/validate-seed
```

Acestea folosesc `X-Gate-Api-Key`, nu JWT.

## Endpoint-uri mobile demo

Pentru aplicatia mobile din `message(3).txt` exista endpoint-uri compatibile:

```text
POST /api/mobile/login-secure
POST /api/mobile/me
POST /api/mobile/monthly-report
POST /api/validate-access
```

Mobile login:

```json
{
  "email": "viewer.demo@parksecure.local",
  "password": "admin123",
  "platform": "ios",
  "deviceIdentifier": "ios-hw-demo-12345"
}
```

Raspuns:

```json
{
  "success": true,
  "accessSeed": "...",
  "user": {
    "accountId": 23,
    "employeeId": 7,
    "email": "viewer.demo@parksecure.local",
    "name": "Elena Dumitru",
    "role": "viewer"
  }
}
```

Validate access:

```json
{
  "accessSeed": "<ACCESS_SEED>"
}
```

Mobile profile:

```http
POST /api/mobile/me
Content-Type: application/json

{
  "accessSeed": "<ACCESS_SEED>"
}
```

Returneaza datele proprii ale angajatului: nume, poza, divizie, numar masina, interval orar, device si persoana/contul care a acordat dreptul.

Mobile monthly report:

```http
POST /api/mobile/monthly-report
Content-Type: application/json

{
  "accessSeed": "<ACCESS_SEED>"
}
```

Returneaza evenimentele angajatului din luna curenta, plus totaluri `ALLOWED`/`DENIED`.

Raspuns permis:

```json
{
  "authorized": true,
  "name": "Elena Dumitru"
}
```

## Flux demo complet

```text
Login admin/HR
-> creare divizie
-> creare angajat
-> creare account legat de employee, daca este cazul
-> register smartphone
-> backend genereaza accessSeed
-> mobile trimite accessSeed prin Bluetooth catre ESP32
-> ESP32 trimite accessSeed la Cloud API
-> Cloud API returneaza ALLOWED/DENIED
-> se salveaza access_event
-> web afiseaza loguri si rapoarte
```

## Date demo

Conturi:

```text
admin@parksecure.local          admin123
hr.demo@parksecure.local        admin123
manager.demo@parksecure.local   admin123
operator.demo@parksecure.local  admin123
viewer.demo@parksecure.local    admin123
```

Pentru test mobile recomandat:

```text
viewer.demo@parksecure.local
admin123
```

Motiv: employee-ul legat de acest cont nu are interval orar restrictiv.

## Observatii importante pentru web

- foloseste `accountId`, nu `userId`
- endpoint-ul `/api/users` lucreaza de fapt cu `accounts`
- nu afisa `password_hash`
- nu salva `accessSeed` in UI decat strict pentru demo
- pentru HR ascunde optiunile `admin` si `hr`
- pentru viewer fa UI read-only
- trateaza 401 ca nelogat/token expirat
- trateaza 403 ca fara permisiune/acces respins
- trateaza 409 ca email duplicat sau employee deja legat de account
- pentru poze, backend-ul asteapta `photoUrl` ca URL text, nu upload de fisier

## Ce este acoperit fata de PDF

Acoperit in backend:

- gestiune utilizatori autorizati prin `accounts`
- roluri si drepturi
- gestiune angajati
- divizii
- asociere unica employee-account
- asociere unica employee-smartphone
- cod/seed securizat pentru acces
- activare/dezactivare acces angajat
- intervale orare de acces
- loguri intrare/iesire
- rapoarte individuale/divizie/global
- endpoint-uri gate/ESP32 pentru demo
- endpoint-uri mobile demo
- date proprii mobile si raport lunar pe accessSeed

De facut mai ales in frontend/web:

- dashboard vizual
- pagini CRUD pentru accounts/employees/divisions
- pagina de loguri cu filtre
- pagini de rapoarte
- ecran demo pentru status poarta/LED-uri bazat pe ultimele evenimente
- mesaje clare pentru denied/allowed si permisiuni insuficiente
