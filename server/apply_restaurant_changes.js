const path = require('path');
// Load .env from server directory
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

console.log('DB Config:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL,
    passwordLength: (process.env.DB_PASSWORD || '').length
});

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: String(process.env.DB_PASSWORD || ''),
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

const sql = `
-- Function to get all restaurants
DROP FUNCTION IF EXISTS get_all_restaurants() CASCADE;
CREATE OR REPLACE FUNCTION get_all_restaurants()
RETURNS TABLE (
    p_cod INTEGER,
    p_nombre VARCHAR,
    p_tipo VARCHAR,
    p_ambiente VARCHAR,
    p_calificacion INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT cod, nombre_res, tipo_res, ambiente_res, calificacion_res
    FROM restaurant
    ORDER BY nombre_res;
END;
$$ LANGUAGE plpgsql;

-- Procedure to add detailed item to package
CREATE OR REPLACE PROCEDURE add_item_to_package(
    p_pkg_id INTEGER,
    p_item_id INTEGER,
    p_type VARCHAR,
    p_start_date DATE,
    p_end_date DATE
) AS $$
DECLARE
    v_cost DECIMAL(10,2);
    v_millaje INTEGER;
    v_exists BOOLEAN;
BEGIN
    -- Basic validation
    IF p_start_date > p_end_date THEN
        RAISE EXCEPTION 'Start date cannot be after end date';
    END IF;

    IF p_type = 'flight' OR p_type = 'transport' THEN
        -- Check duplicate
        SELECT EXISTS(SELECT 1 FROM ser_paq WHERE fk_servicio = p_item_id AND fk_paquete = p_pkg_id) INTO v_exists;
        IF v_exists THEN
            RAISE EXCEPTION 'Service already added to this package';
        END IF;

        -- Default Logic for Cost/Mileage (Business Logic)
        v_cost := 100 + floor(random() * 400); 
        v_millaje := 100; -- Flat mileage reward

        INSERT INTO ser_paq (fk_servicio, fk_paquete, costo_ser, inicio_ser, fin_ser, millaje_ser)
        VALUES (p_item_id, p_pkg_id, v_cost, p_start_date, p_end_date, v_millaje);
        
    ELSIF p_type = 'hotel' THEN
        -- Check duplicate
        SELECT EXISTS(SELECT 1 FROM hot_paq WHERE fk_hotel = p_item_id AND fk_paquete = p_pkg_id) INTO v_exists;
        IF v_exists THEN
            RAISE EXCEPTION 'Hotel already added to this package';
        END IF;

        -- Business Logic for Hotel
        v_cost := 300 + floor(random() * 200);
        v_millaje := 200;

        INSERT INTO hot_paq (fk_hotel, fk_paquete, numero_habitacion_hot, inicio_estadia_hot, fin_estadia_hot, millaje_hot, costo_reserva_hot)
        VALUES (p_item_id, p_pkg_id, 'STD-' || floor(random()*100), p_start_date, p_end_date, v_millaje, v_cost);
    
    ELSIF p_type = 'restaurant' THEN
        -- Check duplicate
        SELECT EXISTS(SELECT 1 FROM res_paq WHERE fk_restaurant = p_item_id AND fk_paquete = p_pkg_id) INTO v_exists;
        IF v_exists THEN
            RAISE EXCEPTION 'Restaurant already added to this package';
        END IF;

        -- Business Logic for Restaurant
        v_cost := 50 + floor(random() * 100);
        v_millaje := 50;

        INSERT INTO res_paq (fk_restaurant, fk_paquete, numero_reservacion_res, inicio_reserva_res, fin_reserva_res, millaje_res, costo_reserva_res)
        VALUES (p_item_id, p_pkg_id, 'RES-' || floor(random()*1000), p_start_date, p_end_date, v_millaje, v_cost);

    ELSE
        RAISE EXCEPTION 'Invalid item type: %', p_type;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Procedure to remove item from package
CREATE OR REPLACE PROCEDURE remove_item_from_package(
    p_pkg_id INTEGER,
    p_item_id INTEGER,
    p_type VARCHAR
) AS $$
BEGIN
    IF p_type = 'flight' OR p_type = 'transport' THEN
        DELETE FROM ser_paq WHERE fk_servicio = p_item_id AND fk_paquete = p_pkg_id;
    ELSIF p_type = 'hotel' THEN
        DELETE FROM hot_paq WHERE fk_hotel = p_item_id AND fk_paquete = p_pkg_id;
    ELSIF p_type = 'restaurant' THEN
        DELETE FROM res_paq WHERE fk_restaurant = p_item_id AND fk_paquete = p_pkg_id;
    ELSE
        RAISE EXCEPTION 'Invalid item type: %', p_type;
    END IF;
END;
$$ LANGUAGE plpgsql;
`;

(async () => {
    try {
        console.log('Applying SQL changes...');
        await pool.query(sql);
        console.log('SQL changes applied successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error applying SQL changes', err);
        process.exit(1);
    }
})();
