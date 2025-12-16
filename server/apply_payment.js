const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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
        const sqlPath = path.join(__dirname, 'update_payment_logic.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Connecting to database...');
        const client = await pool.connect();
        try {
            console.log('Running SQL update for payment logic...');
            await client.query(sql);
            console.log('Update completed successfully!');
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Error running update:', err);
    } finally {
        await pool.end();
    }
}

runUpdate();
