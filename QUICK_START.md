# Quick Start Guide

## Prerequisites Checklist

- [ ] PostgreSQL installed and running
- [ ] Node.js installed (v16+)
- [ ] Your SQL files ready (`create_tables.sql` and `alter_tables.sql`)

## Step 1: Database Setup (5 minutes)

1. **Create the database:**
   ```bash
   createdb viajesucab
   ```
   Or using psql:
   ```sql
   CREATE DATABASE viajesucab;
   ```

2. **Run your SQL files:**
   
   Using the setup script (recommended):
   ```bash
   cd server
   node setup-database.js --all  # Runs drop → create → insert
   ```
   
   Or run individually:
   ```bash
   node setup-database.js drop.sql
   node setup-database.js create.sql
   node setup-database.js insert.sql
   ```
   
   Or manually with psql:
   ```bash
   psql -U postgres -d viajesucab -f drop.sql
   psql -U postgres -d viajesucab -f create.sql
   psql -U postgres -d viajesucab -f insert.sql
   ```

## Step 2: API Server Setup (3 minutes)

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   # Copy the example and edit it
   copy env.example.txt .env
   # Then edit .env with your database credentials
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   You should see: `🚀 Server running on http://localhost:3001`

## Step 3: Frontend Setup (2 minutes)

1. **Go back to root directory:**
   ```bash
   cd ..
   ```

2. **Create `.env` file in root:**
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```

## Step 4: Create Stored Procedures

You need to create stored procedures in PostgreSQL. See `server/example-procedures.sql` for examples.

**Minimum required procedures:**
- `authenticate_user(username, password)` - for login
- `get_all_airlines()` - for airline management
- `upsert_airline(...)` - for creating/updating airlines

## Testing

1. Open browser: http://localhost:3000
2. Check browser console for errors
3. Try logging in (make sure you have a user in the database)

## Troubleshooting

**"Connection refused"**
- Make sure PostgreSQL is running
- Check `.env` file credentials

**"Cannot find module"**
- Run `npm install` in both root and server directories

**CORS errors**
- Make sure API server is running on port 3001
- Check `VITE_API_URL` in frontend `.env`

## Next Steps

1. Create all your stored procedures based on your schema
2. Update `src/services/database.ts` with functions for each stored procedure
3. Replace mock data in components with database calls
4. Test each feature

