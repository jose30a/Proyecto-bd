const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || 'http://localhost:5173';
const EXTRA_ORIGINS = (process.env.EXTRA_FRONTEND_ORIGINS || 'http://localhost:3000').split(',');
const allowedOrigins = [FRONTEND_ORIGIN, ...EXTRA_ORIGINS].map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g., curl) where origin is undefined
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // For development, allow any localhost with any port
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.options('*', cors());
app.use(express.json());

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Generic stored procedure endpoint
app.post('/api/procedure/:procedureName', async (req, res) => {
  const { procedureName } = req.params;
  const params = req.body.params || [];
  
  // Basic validation: procedure name should only contain alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_]+$/.test(procedureName)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid procedure name',
    });
  }
  
  try {
    // Build placeholders and types for parameters (support typed params)
    const values = [];
    const paramPlaceholders = params.length > 0
      ? params.map((p, i) => {
          let pgType = 'TEXT';
          let val = p;

          if (p && typeof p === 'object' && Object.prototype.hasOwnProperty.call(p, 'value') && Object.prototype.hasOwnProperty.call(p, 'type')) {
            val = p.value;
            pgType = String(p.type).toUpperCase();
          } else if (typeof p === 'boolean') {
            pgType = 'BOOLEAN';
          } else if (typeof p === 'number') {
            pgType = 'INTEGER';
          } else {
            pgType = 'TEXT';
          }

          values.push(val);
          return `$${i + 1}::${pgType}`;
        }).join(', ')
      : '';

    const query = `CALL ${procedureName}(${paramPlaceholders})`;

    // Use a dedicated client so we can SET the session parameter for triggers
    const client = await pool.connect();
    let inTx = false;
    try {
      // Determine acting user: prefer x-user-id header, fallback to cookie 'current_user'
      let headerUser = req.header('x-user-id');
      if (!headerUser && req.headers && req.headers.cookie) {
        const match = req.headers.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('current_user='));
        if (match) headerUser = match.split('=')[1];
      }

      // Log what we'll set for auditing (helps debugging when fk_usuario is null)
      console.log(`[procedure] ${procedureName} - acting user from header/cookie:`, headerUser || 'none');

      if (headerUser) {
        await client.query('BEGIN');
        inTx = true;
        await client.query("SELECT set_config('app.current_user', $1, true)", [String(headerUser)]);
      }

      const result = await client.query(query, values.length ? values : []);

      // For register_user, verify insertion and return the created user row
      let data = result.rows && result.rows.length > 0 ? result.rows[0] : { message: 'Procedure executed successfully' };
      if (procedureName === 'register_user' && values && values.length > 0) {
        try {
          const emailParam = values[0];
          const userRes = await client.query('SELECT cod, email_usu, primer_nombre_usu, primer_apellido_usu, fk_cod_rol FROM usuario WHERE email_usu = $1', [emailParam]);
          if (userRes.rows.length > 0) {
            data = userRes.rows[0];
          } else {
            // No user found after procedure call — keep original result and log
            console.warn('register_user executed but user not found for email:', emailParam);
          }
        } catch (selErr) {
          console.error('Error verifying created user after register_user:', selErr);
        }
      }

      if (inTx) {
        await client.query('COMMIT');
      }

      res.json({ success: true, data });
    } catch (error) {
      if (inTx) {
        try { await client.query('ROLLBACK'); } catch (e) { /* ignore rollback errors */ }
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error calling procedure ${procedureName}:`, error);
    console.error(`Query attempted: CALL ${procedureName}(...)`);
    console.error(`Parameters:`, params);

    if (error.code === '42883' || (error.message && error.message.includes('does not exist'))) {
      const checkQuery = `
        SELECT proname, pg_get_function_arguments(oid) as args
        FROM pg_proc 
        WHERE proname = $1 AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      `;
      try {
        const checkResult = await pool.query(checkQuery, [procedureName]);
        if (checkResult.rows.length === 0) {
          return res.status(500).json({
            success: false,
            error: `Procedure ${procedureName} does not exist in the database.`,
            hint: 'Make sure you ran: psql -U postgres -d viajesucab -f server/create.sql',
            troubleshooting: 'Check if the procedure was created: SELECT proname FROM pg_proc WHERE proname = \'' + procedureName + '\';'
          });
        } else {
          return res.status(500).json({
            success: false,
            error: `Procedure ${procedureName} exists but parameter types don't match.`,
            procedure_signature: checkResult.rows[0].args,
            provided_params: params,
            hint: 'Check the procedure signature in create.sql and ensure parameters match.'
          });
        }
      } catch (checkError) {
        // fall through to generic error
      }
    }

    res.status(500).json({ success: false, error: error.message, code: error.code });
  }
});

// Generic function endpoint (for PostgreSQL functions that return data)
app.post('/api/function/:functionName', async (req, res) => {
  const { functionName } = req.params;
  const params = req.body.params || [];
  
  // Basic validation: function name should only contain alphanumeric, underscore, and hyphen
  if (!/^[a-zA-Z0-9_]+$/.test(functionName)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid function name',
    });
  }
  
    try {
    // Call PostgreSQL function using SELECT
    // Support typed params objects { value, type } and basic detection: number->INTEGER, boolean->BOOLEAN, else TEXT
    const funcValues = [];
    const paramPlaceholders = params.length > 0
      ? params.map((p, i) => {
          let pgType = 'TEXT';
          let val = p;

          if (p && typeof p === 'object' && Object.prototype.hasOwnProperty.call(p, 'value') && Object.prototype.hasOwnProperty.call(p, 'type')) {
            val = p.value;
            pgType = String(p.type).toUpperCase();
          } else if (typeof p === 'boolean') {
            pgType = 'BOOLEAN';
          } else if (typeof p === 'number') {
            pgType = 'INTEGER';
          } else {
            pgType = 'TEXT';
          }

          funcValues.push(val);
          return `$${i + 1}::${pgType}`;
        }).join(', ')
      : '';
    const query = `SELECT * FROM ${functionName}(${paramPlaceholders})`;

    const client = await pool.connect();
    let inTx = false;
    try {
      // Determine acting user: prefer x-user-id header, fallback to cookie 'current_user'
      let headerUser = req.header('x-user-id');
      if (!headerUser && req.headers && req.headers.cookie) {
        const match = req.headers.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('current_user='));
        if (match) headerUser = match.split('=')[1];
      }

      // Log what we'll set for auditing (helps debugging when fk_usuario is null)
      console.log(`[function] ${functionName} - acting user from header/cookie:`, headerUser || 'none');

      if (headerUser) {
        await client.query('BEGIN');
        inTx = true;
        await client.query("SELECT set_config('app.current_user', $1, true)", [String(headerUser)]);
      }

      const result = await client.query(query, funcValues.length ? funcValues : []);

      // If this is authentication, set an HttpOnly cookie for subsequent requests
      if (functionName === 'authenticate_user' && result.rows && result.rows.length > 0) {
        const userRow = result.rows[0];
        const userId = userRow.p_cod || userRow.p_cod || userRow.p_fk_cod || userRow.p_cod;
        if (userId) {
          // Set cookie (HttpOnly) so browser sends it automatically
          res.cookie('current_user', String(userId), { httpOnly: true, path: '/' });
        }
      }

      if (inTx) {
        await client.query('COMMIT');
      }

      res.json({ success: true, data: result.rows });
    } catch (error) {
      if (inTx) {
        try { await client.query('ROLLBACK'); } catch (e) { /* ignore rollback errors */ }
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error calling function ${functionName}:`, error);

    // Provide helpful error message if function doesn't exist
    if (error.code === '42883') {
      return res.status(500).json({
        success: false,
        error: `Function ${functionName} does not exist or parameter types don't match. Make sure you've run the stored procedures SQL file.`,
        hint: 'Run: psql -U postgres -d viajesucab -f server/auth-procedures.sql'
      });
    }

    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Current user endpoint: returns user info based on cookie or header
app.get('/api/me', async (req, res) => {
  try {
    // Prefer x-user-id header, fallback to cookie 'current_user'
    let headerUser = req.header('x-user-id');
    if (!headerUser && req.headers && req.headers.cookie) {
      const match = req.headers.cookie.split(';').map(c => c.trim()).find(c => c.startsWith('current_user='));
      if (match) headerUser = match.split('=')[1];
    }

    console.log('/api/me header/cookie acting user:', headerUser || 'none');

    if (!headerUser) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    const userIdNum = parseInt(String(headerUser), 10);
    if (Number.isNaN(userIdNum)) {
      console.warn('/api/me invalid user id value:', headerUser);
      return res.status(401).json({ success: false, error: 'Invalid authenticated user' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.current_user', $1, true)", [String(userIdNum)]);
      const result = await client.query('SELECT * FROM get_user_by_id($1)', [userIdNum]);
      await client.query('COMMIT');

      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (err) {
      try { await client.query('ROLLBACK'); } catch (e) {}
      console.error('/api/me error:', err);
      res.status(500).json({ success: false, error: err.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error in /api/me:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

