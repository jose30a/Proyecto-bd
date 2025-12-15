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

async function runUpdate() {
    try {
        const sqlPath = path.join(__dirname, 'update_return_id.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Connecting to database...');
        const client = await pool.connect();
        try {
            console.log('Running SQL update...');
            await client.query(sql);
            console.log('✅ Update applied successfully.');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ Error executing update:', err);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runUpdate();
