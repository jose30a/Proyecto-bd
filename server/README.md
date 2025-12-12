# API Server

This is a minimal Express server that acts as a proxy to PostgreSQL stored procedures. It contains **NO business logic** - all logic is in the database stored procedures.

## Installation

```bash
npm install
```

## Configuration

1. Copy `env.example.txt` to `.env`
2. Update `.env` with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viajesucab
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
PORT=3001
```

## Running

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Call Stored Procedure
```
POST /api/procedure/:procedureName
Body: { "params": [param1, param2, ...] }
```

### Call PostgreSQL Function
```
POST /api/function/:functionName
Body: { "params": [param1, param2, ...] }
```

## Example Usage

**Calling a stored procedure:**
```javascript
POST /api/procedure/upsert_airline
{
  "params": ["AER-01", "Avior Airlines", "Venezuela", "Caracas", "Active"]
}
```

**Calling a function:**
```javascript
POST /api/function/get_all_airlines
{
  "params": []
}
```

## Database Setup

Use `setup-database.js` to run your SQL files. The script supports `create.sql`, `drop.sql`, and `insert.sql`:

**Run all files in order (drop → create → insert):**
```bash
node setup-database.js --all
```

**Run specific files:**
```bash
node setup-database.js create.sql
node setup-database.js drop.sql
node setup-database.js insert.sql
node setup-database.js drop.sql create.sql insert.sql
```

**Use flags with default file names:**
```bash
node setup-database.js --create
node setup-database.js --drop --create --insert
```

**Or manually with psql:**
```bash
psql -U postgres -d viajesucab -f drop.sql
psql -U postgres -d viajesucab -f create.sql
psql -U postgres -d viajesucab -f insert.sql
```

**Note:** Files are executed in the order you specify them. For a fresh setup, run: `drop.sql` → `create.sql` → `insert.sql`

## Important Notes

- This server ONLY calls stored procedures - no business logic here
- All validation, calculations, and business rules should be in PostgreSQL stored procedures
- The server handles connection pooling and error handling
- CORS is enabled for frontend communication

