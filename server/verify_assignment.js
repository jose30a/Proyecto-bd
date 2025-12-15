
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function verify() {
    try {
        const res = await pool.query(`
      SELECT 
          p.tipo_pro AS promocion,
          s.nombre_ser AS servicio,
          ps.fecha_inicio,
          ps.fecha_fin
      FROM pro_ser ps
      JOIN promocion p ON ps.fk_promocion = p.cod
      JOIN servicio s ON ps.fk_servicio = s.cod;
    `);
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

verify();
