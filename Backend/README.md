Hvordan kjøre backend:
Add pom.xml as maven project hvis det ikke er


docker compose up --build

Hvordan lukke backend (containers):
docker compose down

Hvordan resette db og lukke backend:
docker compose down -v

Info:
Backend krever at lombok og docker er installert

Lage access-code i Postman:
URL: POST http://localhost:8080/api/access-codes
Header Content-type application.json
Body (raw json):
{
"daycareId": 1,
"maxUses": 10,
"createdByUserId": 3
}