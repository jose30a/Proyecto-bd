const { Pool } = require('pg');
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
        console.log('Checking upsert_promotion procedures...\n');

        const result = await pool.query(`
      SELECT 
        p.proname as procedure_name,
        pg_get_function_arguments(p.oid) as arguments
      FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE p.proname = 'upsert_promotion'
        AND n.nspname = 'public';
    `);

        console.log('Found procedures:');
        if (result.rows.length === 0) {
            console.log('   ❌ No upsert_promotion procedure found!');
        } else {
            result.rows.forEach((row, i) => {
                console.log(`${i + 1}. ${row.procedure_name}`);
                console.log(`   ${row.arguments}`);
            });
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
}

run();
