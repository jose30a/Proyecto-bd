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
            console.log('Dropping old upsert_airline PROCEDURE...');

            // Update: DROP all potential procedure signatures
            await client.query(`DROP PROCEDURE IF EXISTS upsert_airline(TEXT, VARCHAR, VARCHAR, INTEGER, VARCHAR) CASCADE;`);
            await client.query(`DROP PROCEDURE IF EXISTS upsert_airline(INTEGER, VARCHAR, VARCHAR, INTEGER, VARCHAR) CASCADE;`);

            console.log('Creating new upsert_airline FUNCTION...');

            // Function signature
            const query = `
        CREATE OR REPLACE FUNCTION upsert_airline(
            p_id TEXT,
            p_name VARCHAR,
            p_origin_type VARCHAR,
            p_fk_lug INTEGER,
            p_status VARCHAR
        ) RETURNS INTEGER AS $$
        DECLARE v_id INTEGER;
        BEGIN 
            -- Handle p_id as TEXT
            IF p_id IS NULL OR p_id = '' OR p_id = 'null' THEN v_id := NULL;
            ELSE v_id := p_id::INTEGER;
            END IF;

            IF v_id IS NULL THEN
                INSERT INTO aerolinea (
                        nombre,
                        origen_aer,
                        servicio_aer,
                        f_inicio_servicio_prov,
                        fk_cod_lug
                    )
                VALUES (
                        p_name,
                        COALESCE(p_origin_type, 'Internacional'),
                        COALESCE(p_status, 'Active'),
                        CURRENT_DATE,
                        p_fk_lug
                    ) RETURNING cod INTO v_id;
            ELSE
                UPDATE aerolinea
                SET nombre = p_name,
                    origen_aer = COALESCE(p_origin_type, origen_aer),
                    servicio_aer = COALESCE(p_status, servicio_aer),
                    fk_cod_lug = COALESCE(p_fk_lug, fk_cod_lug)
                WHERE cod = v_id;
            END IF;
            
            RETURN v_id;
        END;
        $$ LANGUAGE plpgsql;
      `;

            await client.query(query);

            console.log('✅ upsert_airline FUNCTION updated successfully!');
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
