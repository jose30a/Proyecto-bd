# Authentication Stored Procedures

This file contains all the stored procedures necessary for user authentication using `email_usu` and `password_usu` from the `usuario` table.

## Installation

Run the stored procedures file in your PostgreSQL database:

```bash
psql -U postgres -d viajesucab -f auth-procedures.sql
```

Or using the setup script (if you add it to your workflow):

```bash
node setup-database.js auth-procedures.sql
```

## Available Functions

### 1. `authenticate_user(email, password)`

Authenticates a user by email and password.

**Parameters:**
- `p_email VARCHAR` - User's email address
- `p_password VARCHAR` - User's password (plain text, will be hashed)

**Returns:**
- `cod` - User ID
- `email_usu` - User's email
- `primer_nombre_usu` - First name
- `segundo_nombre_usu` - Second name (optional)
- `primer_apellido_usu` - First last name
- `segundo_apellido_usu` - Second last name (optional)
- `nombre_rol` - Role name from `rol` table
- `fk_cod_rol` - Role ID

**Usage:**
```sql
SELECT * FROM authenticate_user('user@example.com', 'password123');
```

**Frontend Usage:**
```typescript
import { authenticateUser } from '../services/database';

const user = await authenticateUser({
  email: 'user@example.com',
  password: 'password123'
});
```

### 2. `get_user_by_id(user_id)`

Retrieves user information by user ID.

**Parameters:**
- `p_user_id INTEGER` - User's ID (cod)

**Returns:** Same structure as `authenticate_user`

**Usage:**
```sql
SELECT * FROM get_user_by_id(1);
```

### 3. `email_exists(email)`

Checks if an email is already registered.

**Parameters:**
- `p_email VARCHAR` - Email to check

**Returns:**
- `email_exists BOOLEAN` - True if email exists

**Usage:**
```sql
SELECT * FROM email_exists('user@example.com');
```

**Frontend Usage:**
```typescript
import { emailExists } from '../services/database';

const exists = await emailExists('user@example.com');
```

### 4. `register_user(...)`

Registers a new user.

**Parameters:**
- `p_email VARCHAR` - User's email
- `p_password VARCHAR` - User's password (plain text)
- `p_primer_nombre VARCHAR` - First name
- `p_segundo_nombre VARCHAR` - Second name (can be NULL)
- `p_primer_apellido VARCHAR` - First last name
- `p_segundo_apellido VARCHAR` - Second last name (can be NULL)
- `p_ci VARCHAR` - ID number
- `p_tipo_documento VARCHAR` - Document type
- `p_n_pasaporte VARCHAR` - Passport number
- `p_fk_cod_rol INTEGER` - Role ID (defaults to 2 = 'Cliente')

**Returns:**
- `register_user INTEGER` - New user's ID

**Usage:**
```sql
SELECT * FROM register_user(
    'newuser@example.com',
    'password123',
    'John',
    NULL,
    'Doe',
    NULL,
    'V-12345678',
    'V',
    'P-12345678',
    2
);
```

### 5. `update_user_password(email, old_password, new_password)`

Updates a user's password.

**Parameters:**
- `p_email VARCHAR` - User's email
- `p_old_password VARCHAR` - Current password
- `p_new_password VARCHAR` - New password

**Returns:**
- `update_user_password BOOLEAN` - True if successful

**Usage:**
```sql
SELECT * FROM update_user_password(
    'user@example.com',
    'oldpassword',
    'newpassword'
);
```

## Password Hashing

All passwords are hashed using **MD5** to match the format used in `insert.sql`:

```sql
v_hashed_password := md5(p_password);
```

**Note:** MD5 is not the most secure hashing algorithm. For production, consider:
1. Using `pgcrypto` extension with `crypt()` and `gen_salt('bf')` for bcrypt
2. Updating all existing passwords in the database
3. Modifying the stored procedures to use bcrypt

Example with bcrypt:
```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash password
v_hashed_password := crypt(p_password, gen_salt('bf'));

-- Verify password
WHERE u.password_usu = crypt(p_password, u.password_usu)
```

## Error Handling

All functions include proper error handling:
- `authenticate_user` raises exception if credentials are invalid
- `get_user_by_id` raises exception if user not found
- `register_user` raises exception if email already exists
- `update_user_password` raises exception if old password is incorrect

## Frontend Integration

The frontend service layer (`src/services/database.ts`) is already configured to use these functions:

```typescript
// Login
const user = await authenticateUser({ email, password });

// Check email
const exists = await emailExists(email);

// Register
const userId = await registerUser(userData);

// Update password
const success = await updateUserPassword(email, oldPass, newPass);
```

## Testing

Test the functions directly in PostgreSQL:

```sql
-- Test authentication
SELECT * FROM authenticate_user('test@example.com', 'password');

-- Test email check
SELECT * FROM email_exists('test@example.com');

-- Test registration
SELECT * FROM register_user(
    'new@example.com', 'pass123', 'John', NULL, 'Doe', NULL,
    'V-12345', 'V', 'P-12345', 2
);
```

## Security Notes

1. **Never store plain text passwords** - Always hash them
2. **Use HTTPS** - Protect credentials in transit
3. **Validate input** - Check email format, password strength
4. **Rate limiting** - Prevent brute force attacks
5. **Session management** - Use secure session tokens
6. **Consider bcrypt** - More secure than MD5 for production

