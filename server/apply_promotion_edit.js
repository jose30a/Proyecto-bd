const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function run() {
    try {
        const sqlPath = path.join(__dirname, 'fix_promotion_edit.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Adding upsert_promotion(INTEGER, TEXT, INTEGER)...');
        await pool.query(sql);
        console.log('✅ Procedure overload added successfully.');
    } catch (err) {
        console.error('❌ Failed:', err.message);
    } finally {
        await pool.end();
    }
}

run();
