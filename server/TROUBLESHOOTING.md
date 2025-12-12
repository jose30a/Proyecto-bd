# Troubleshooting Guide

## Error: "function does not exist" or "function ... does not exist"

### Problem
You're getting an error like:
```
Error calling function authenticate_user: error: function authenticate_user(unknown, unknown) does not exist
```

### Solution 1: Verify Functions Are Created

First, check if the functions exist in your database:

```bash
psql -U postgres -d viajesucab -f server/verify-functions.sql
```

Or manually:
```sql
SELECT proname, pg_get_function_arguments(oid) 
FROM pg_proc 
WHERE proname = 'authenticate_user';
```

**If no results:** The functions haven't been created. Run:

```bash
psql -U postgres -d viajesucab -f server/auth-procedures.sql
```

Or using the setup script:
```bash
cd server
node setup-database.js auth-procedures.sql
```

### Solution 2: Check Database Connection

Make sure you're connected to the correct database:

```bash
psql -U postgres -d viajesucab
```

Then verify:
```sql
\dt  -- List tables (should show 'usuario', 'rol', etc.)
\df  -- List functions (should show 'authenticate_user', etc.)
```

### Solution 3: Recreate Functions

If functions exist but still not working, drop and recreate:

```sql
DROP FUNCTION IF EXISTS authenticate_user(VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS get_user_by_id(INTEGER);
DROP FUNCTION IF EXISTS email_exists(VARCHAR);
DROP FUNCTION IF EXISTS register_user(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR, INTEGER);
DROP FUNCTION IF EXISTS update_user_password(VARCHAR, VARCHAR, VARCHAR);
```

Then run:
```bash
psql -U postgres -d viajesucab -f server/auth-procedures.sql
```

### Solution 4: Check Function Signature

The function expects:
- `p_email VARCHAR` (or TEXT)
- `p_password VARCHAR` (or TEXT)

Make sure you're calling it with string parameters.

### Solution 5: Test Function Directly

Test the function directly in PostgreSQL:

```sql
-- Test with sample data
SELECT * FROM authenticate_user('test@example.com', 'password123');
```

If this works, the issue is in the API server. If it doesn't, the function needs to be created.

## Common Issues

### Issue: "No function matches the given name and argument types"

**Cause:** Parameter type mismatch

**Fix:** The server now automatically casts parameters. If still failing:
1. Check that parameters are being sent as strings
2. Verify the function signature matches what you're calling

### Issue: "Invalid email or password" (but credentials are correct)

**Cause:** Password hashing mismatch

**Fix:** Check how passwords are stored:
```sql
SELECT email_usu, password_usu FROM usuario LIMIT 1;
```

Passwords should be MD5 hashes. If using a different format, update `auth-procedures.sql`.

### Issue: Function exists but returns empty

**Cause:** No matching data in database

**Fix:** Verify data exists:
```sql
SELECT COUNT(*) FROM usuario;
SELECT email_usu FROM usuario LIMIT 5;
```

## Quick Diagnostic Commands

```bash
# 1. Check if database exists
psql -U postgres -l | grep viajesucab

# 2. Check if tables exist
psql -U postgres -d viajesucab -c "\dt"

# 3. Check if functions exist
psql -U postgres -d viajesucab -c "\df authenticate*"

# 4. Check user data
psql -U postgres -d viajesucab -c "SELECT email_usu FROM usuario LIMIT 5;"

# 5. Test function directly
psql -U postgres -d viajesucab -c "SELECT * FROM authenticate_user('test@example.com', 'test');"
```

## Still Having Issues?

1. Check server logs for detailed error messages
2. Verify `.env` file has correct database credentials
3. Ensure PostgreSQL is running
4. Check that you've run `create.sql` and `insert.sql` before `auth-procedures.sql`

