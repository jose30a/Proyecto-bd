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
        const sqlPath = path.join(__dirname, 'fix_get_package_details.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Fixing get_package_details function...');
        await pool.query(sql);
        console.log('✅ Function get_package_details fixed successfully.');
    } catch (err) {
        console.error('❌ Failed to fix function:', err);
    } finally {
        await pool.end();
    }
}

run();
