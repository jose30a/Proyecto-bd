const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
    // For procedures with OUT parameters, we need to use a DO block or SELECT
    // The best approach is to use SELECT with the procedure call
    const paramPlaceholders = params.length > 0
      ? params.map((_, i) => {
          const param = params[i];
          if (typeof param === 'number' || (typeof param === 'string' && /^\d+$/.test(param))) {
            return `$${i + 1}::INTEGER`;
          }
          return `$${i + 1}::TEXT`;
        }).join(', ')
      : '';
    
    // For procedures with OUT parameters, we need to call them differently
    // Use a SELECT statement that calls the procedure and returns the OUT parameters
    // This requires wrapping in a function-like call or using DO block
    // Actually, the simplest is to use CALL and then query the result
    // But PostgreSQL procedures with OUT params need special handling
    
    // Try using CALL first - if it fails, we'll catch and provide better error
    const query = `CALL ${procedureName}(${paramPlaceholders})`;
    const result = await pool.query(query, params);
    
    // Procedures with OUT parameters return a single row with the OUT values as columns
    // The column names match the OUT parameter names (p_cod, p_email_usu, etc.)
    const data = result.rows.length > 0 ? result.rows[0] : { message: 'Procedure executed successfully' };
    
    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error(`Error calling procedure ${procedureName}:`, error);
    console.error(`Query attempted: CALL ${procedureName}(...)`);
    console.error(`Parameters:`, params);
    
    // Provide helpful error message if procedure doesn't exist
    if (error.code === '42883' || error.message.includes('does not exist')) {
      // Check if procedure exists
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
        // If check fails, just return the original error
      }
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code,
    });
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
    // For VARCHAR/TEXT parameters, cast to text; for integers, keep as is
    const paramPlaceholders = params.length > 0
      ? params.map((_, i) => {
          // Try to detect if it's a number, otherwise cast to text
          const param = params[i];
          if (typeof param === 'number' || (typeof param === 'string' && /^\d+$/.test(param))) {
            return `$${i + 1}::INTEGER`;
          }
          return `$${i + 1}::TEXT`;
        }).join(', ')
      : '';
    const query = `SELECT * FROM ${functionName}(${paramPlaceholders})`;
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      data: result.rows,
    });
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
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

