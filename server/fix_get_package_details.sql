-- Fixed version of get_package_details function
-- This version works with the actual schema where hotels and restaurants
-- are linked via hot_paq and res_paq tables, not directly through servicio

DROP FUNCTION IF EXISTS get_package_details(INTEGER) CASCADE;

CREATE OR REPLACE FUNCTION get_package_details(p_package_id INTEGER) 
RETURNS TABLE (
    item_type VARCHAR,
    item_id INTEGER,
    item_name VARCHAR,
    inicio DATE,
    fin DATE,
    costo DECIMAL,
    millaje INTEGER
) AS $$
BEGIN
    RETURN QUERY
    
    -- Get services from ser_paq
    SELECT 
        'service'::VARCHAR AS item_type,
        sp.fk_servicio AS item_id,
        COALESCE(s.nombre_ser, 'Unknown Service')::VARCHAR AS item_name,
        sp.inicio_ser AS inicio,
        sp.fin_ser AS fin,
        sp.costo_ser AS costo,
        sp.millaje_ser AS millaje
    FROM ser_paq sp
    LEFT JOIN servicio s ON sp.fk_servicio = s.cod
    WHERE sp.fk_paquete = p_package_id
    
    UNION ALL
    
    -- Get hotels from hot_paq
    SELECT 
        'hotel'::VARCHAR AS item_type,
        hp.fk_hotel AS item_id,
        COALESCE(h.nombre_hot, 'Unknown Hotel')::VARCHAR AS item_name,
        hp.inicio_estadia_hot AS inicio,
        hp.fin_estadia_hot AS fin,
        hp.costo_reserva_hot AS costo,
        hp.millaje_hot AS millaje
    FROM hot_paq hp
    LEFT JOIN hotel h ON hp.fk_hotel = h.cod
    WHERE hp.fk_paquete = p_package_id
    
    UNION ALL
    
    -- Get restaurants from res_paq
    SELECT 
        'restaurant'::VARCHAR AS item_type,
        rp.fk_restaurant AS item_id,
        COALESCE(r.nombre_res, 'Unknown Restaurant')::VARCHAR AS item_name,
        rp.inicio_reserva_res AS inicio,
        rp.fin_reserva_res AS fin,
        rp.costo_reserva_res AS costo,
        rp.millaje_res AS millaje
    FROM res_paq rp
    LEFT JOIN restaurant r ON rp.fk_restaurant = r.cod
    WHERE rp.fk_paquete = p_package_id
    
    UNION ALL
    
    -- Get child packages with their total cost
    SELECT 
        'package'::VARCHAR AS item_type,
        pp.fk_paquete_hijo AS item_id,
        pt.nombre_paq::VARCHAR AS item_name,
        MIN(LEAST(
            (SELECT MIN(sp2.inicio_ser) FROM ser_paq sp2 WHERE sp2.fk_paquete = pt.cod),
            (SELECT MIN(hp2.inicio_estadia_hot) FROM hot_paq hp2 WHERE hp2.fk_paquete = pt.cod),
            (SELECT MIN(rp2.inicio_reserva_res) FROM res_paq rp2 WHERE rp2.fk_paquete = pt.cod)
        )) AS inicio,
        MAX(GREATEST(
            (SELECT MAX(sp2.fin_ser) FROM ser_paq sp2 WHERE sp2.fk_paquete = pt.cod),
            (SELECT MAX(hp2.fin_estadia_hot) FROM hot_paq hp2 WHERE hp2.fk_paquete = pt.cod),
            (SELECT MAX(rp2.fin_reserva_res) FROM res_paq rp2 WHERE rp2.fk_paquete = pt.cod)
        )) AS fin,
        COALESCE(
            (SELECT SUM(sp2.costo_ser) FROM ser_paq sp2 WHERE sp2.fk_paquete = pt.cod), 0
        ) + COALESCE(
            (SELECT SUM(hp2.costo_reserva_hot) FROM hot_paq hp2 WHERE hp2.fk_paquete = pt.cod), 0
        ) + COALESCE(
            (SELECT SUM(rp2.costo_reserva_res) FROM res_paq rp2 WHERE rp2.fk_paquete = pt.cod), 0
        ) AS costo,
        (COALESCE(
            (SELECT SUM(sp2.millaje_ser) FROM ser_paq sp2 WHERE sp2.fk_paquete = pt.cod), 0
        ) + COALESCE(
            (SELECT SUM(hp2.millaje_hot) FROM hot_paq hp2 WHERE hp2.fk_paquete = pt.cod), 0
        ) + COALESCE(
            (SELECT SUM(rp2.millaje_res) FROM res_paq rp2 WHERE rp2.fk_paquete = pt.cod), 0
        ))::INTEGER AS millaje
    FROM paq_paq pp
    JOIN paquete_turistico pt ON pp.fk_paquete_hijo = pt.cod
    WHERE pp.fk_paquete_padre = p_package_id
    GROUP BY pp.fk_paquete_hijo, pt.nombre_paq, pt.cod;
    
END;
$$ LANGUAGE plpgsql;
