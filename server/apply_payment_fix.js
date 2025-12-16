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
        const sqlPath = path.join(__dirname, 'update_process_payment.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Updating process_payment procedure...');
        await pool.query(sql);
        console.log('✅ Procedure process_payment updated successfully.');
    } catch (err) {
        console.error('❌ Failed to update procedure:', err);
    } finally {
        await pool.end();
    }
}

run();
