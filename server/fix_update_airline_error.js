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

async function applyFix() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        try {
            console.log('Dropping rogue procedure upsert_airline(INTEGER, VARCHAR, VARCHAR, INTEGER)...');

            // Drop the specific rogue procedure identified
            await client.query(`DROP PROCEDURE IF EXISTS upsert_airline(INTEGER, VARCHAR, VARCHAR, INTEGER) CASCADE;`);

            console.log('Creating overload for upsert_airline(INTEGER, VARCHAR, VARCHAR, INTEGER) returning INTEGER...');

            // Create an overload that accepts INTEGER id and calls the main function
            const query = `
        CREATE OR REPLACE FUNCTION upsert_airline(
            p_id INTEGER,
            p_name VARCHAR,
            p_origin_type VARCHAR,
            p_fk_lug INTEGER
        ) RETURNS INTEGER AS $$
        BEGIN 
            -- Just call the main function converting param to text
            -- Note: p_id::TEXT is safe
            RETURN upsert_airline(p_id::TEXT, p_name, p_origin_type, p_fk_lug);
        END;
        $$ LANGUAGE plpgsql;
      `;

            await client.query(query);

            console.log('✅ Fix applied: Dropped procedure, added function overload.');

        } finally {
            client.release();
        }
    } catch (error) {
        console.error('❌ Error applying fix:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

applyFix();
