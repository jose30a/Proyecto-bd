# PostgreSQL Database Setup Guide

This guide will walk you through connecting your React frontend to a PostgreSQL database using stored procedures.

## Architecture Overview

- **Frontend**: React application (already set up)
- **Minimal API Layer**: Express server that ONLY calls PostgreSQL stored procedures (no business logic)
- **Database**: PostgreSQL with all business logic in stored procedures

## Prerequisites

1. **PostgreSQL** installed and running
   - Download from: https://www.postgresql.org/download/
   - Default port: 5432

2. **Node.js** (v16 or higher)
   - Already installed for your React app

## Step-by-Step Setup

### Step 1: Create PostgreSQL Database

1. Open PostgreSQL command line or pgAdmin
2. Create a new database:

```sql
CREATE DATABASE viajesucab;
```

Or using command line:
```bash
createdb viajesucab
```

### Step 2: Set Up the API Server

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from the example:
```bash
# Copy env.example.txt to .env and update with your database credentials
cp env.example.txt .env
```

4. Edit `.env` file with your PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=viajesucab
DB_USER=postgres
DB_PASSWORD=your_actual_password
DB_SSL=false

PORT=3001
```

### Step 3: Run Your SQL Files

1. Place your SQL files (`create.sql`, `drop.sql`, and `insert.sql`) in the `server` directory

2. Run the setup script with various options:

**Run a single file:**
```bash
node setup-database.js create.sql
node setup-database.js drop.sql
node setup-database.js insert.sql
```

**Run multiple files in order:**
```bash
node setup-database.js drop.sql create.sql insert.sql
node setup-database.js create.sql insert.sql
```

**Use flags with default file names:**
```bash
node setup-database.js --create
node setup-database.js --drop --create --insert
node setup-database.js --all  # Runs drop → create → insert
```

**Or manually run your SQL files using psql:**
```bash
psql -U postgres -d viajesucab -f drop.sql
psql -U postgres -d viajesucab -f create.sql
psql -U postgres -d viajesucab -f insert.sql
```

**Note:** The script executes files in the order you specify them. For a fresh setup, typically you'd run: `drop.sql` → `create.sql` → `insert.sql`

### Step 4: Stored Procedures

The stored procedures are already included in `create.sql` at the end of the file. When you run `create.sql`, all procedures will be created automatically.

**The authentication procedures included are:**
- `authenticate_user(email, password)` - Authenticates user and returns user data
- `get_user_by_id(user_id)` - Gets user information by ID
- `email_exists(email)` - Checks if email is registered
- `register_user(...)` - Registers a new user
- `update_user_password(...)` - Updates user password

**All procedures use:**
- `email_usu` and `password_usu` from the `usuario` table
- MD5 password hashing (matching your `insert.sql` format)
- OUT parameters to return data
- Joins with `rol` table to get user roles

**Note:** All procedures are stored procedures (not functions) and use OUT parameters to return data. They are automatically created when you run `create.sql`.

#### Example: Get All Airlines Function

```sql
-- Function to get all airlines
CREATE OR REPLACE FUNCTION get_all_airlines()
RETURNS TABLE (
    id VARCHAR,
    name VARCHAR,
    origin_country VARCHAR,
    origin_city VARCHAR,
    status VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.name,
        a.origin_country,
        a.origin_city,
        a.status
    FROM airlines a
    ORDER BY a.name;
END;
$$ LANGUAGE plpgsql;
```

#### Example: Upsert Airline Procedure

```sql
-- Procedure to create or update airline
CREATE OR REPLACE PROCEDURE upsert_airline(
    p_id VARCHAR,
    p_name VARCHAR,
    p_origin_country VARCHAR,
    p_origin_city VARCHAR,
    p_status VARCHAR
)
AS $$
BEGIN
    INSERT INTO airlines (id, name, origin_country, origin_city, status)
    VALUES (p_id, p_name, p_origin_country, p_origin_city, p_status)
    ON CONFLICT (id) 
    DO UPDATE SET
        name = EXCLUDED.name,
        origin_country = EXCLUDED.origin_country,
        origin_city = EXCLUDED.origin_city,
        status = EXCLUDED.status;
END;
$$ LANGUAGE plpgsql;
```

### Step 5: Start the API Server

In the `server` directory:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

### Step 6: Configure Frontend Environment

1. Create a `.env` file in the root directory (same level as `package.json`):
```env
VITE_API_URL=http://localhost:3001/api
```

2. Restart your Vite dev server if it's running:
```bash
npm run dev
```

### Step 7: Test the Connection

1. Start both servers:
   - API server: `cd server && npm start`
   - Frontend: `npm run dev`

2. Open your browser and check the browser console for any connection errors

3. Try logging in (make sure you have a user in your database)

## Project Structure

```
Design Login Screen/
├── server/                 # Minimal API layer
│   ├── index.js           # Express server (only calls stored procedures)
│   ├── package.json        # Server dependencies
│   ├── .env               # Database configuration (create this)
│   └── setup-database.js  # Script to run SQL files
├── src/
│   ├── services/
│   │   ├── api.ts         # API client for calling procedures
│   │   └── database.ts    # Database service layer
│   └── components/        # Your React components
└── package.json           # Frontend dependencies
```

## How It Works

1. **Frontend** calls functions from `src/services/database.ts`
2. **Database service** uses `src/services/api.ts` to make HTTP requests
3. **API server** (`server/index.js`) receives requests and calls PostgreSQL stored procedures
4. **PostgreSQL** executes stored procedures (all business logic is here)
5. Results are returned back through the chain

## Important Notes

- **No business logic in the API server**: The Express server only proxies calls to stored procedures
- **All logic in PostgreSQL**: Create stored procedures/functions for all operations
- **Security**: Never expose database credentials in the frontend. The API server handles all database connections.

## Troubleshooting

### Connection Issues

1. **"Connection refused"**: Make sure PostgreSQL is running
   ```bash
   # Check PostgreSQL status (Windows)
   sc query postgresql-x64-14
   ```

2. **"Authentication failed"**: Check your `.env` file credentials

3. **"Database does not exist"**: Create the database first (Step 1)

### CORS Issues

If you see CORS errors, the server already has CORS enabled. Make sure:
- API server is running on port 3001
- Frontend `.env` has correct `VITE_API_URL`

### Stored Procedure Errors

- Make sure your stored procedures are created in the database
- Check PostgreSQL logs for detailed error messages
- Verify procedure names match what you're calling from the frontend

## Next Steps

1. Create all necessary stored procedures for your application
2. Update `src/services/database.ts` with functions for all your stored procedures
3. Update React components to use the database service instead of mock data
4. Test each feature end-to-end

## Example: Updating AirlineManagement Component

Replace mock data with database calls:

```typescript
// In AirlineManagement.tsx
import { getAllAirlines, upsertAirline, deleteAirline } from '../services/database';

// Replace useState mock data with:
useEffect(() => {
  getAllAirlines().then(setAirlines).catch(console.error);
}, []);

// Update handleSave:
const handleSave = async () => {
  try {
    await upsertAirline(formData);
    // Refresh list
    const updated = await getAllAirlines();
    setAirlines(updated);
    setIsModalOpen(false);
  } catch (error) {
    alert('Error saving airline: ' + error.message);
  }
};
```

