CREATE OR REPLACE FUNCTION create_package_returning_id(
    p_name VARCHAR,
    p_desc TEXT,
    p_status VARCHAR,
    p_millaje INTEGER,
    p_costo INTEGER,
    p_huella DECIMAL,
    p_usuario_id INTEGER
) RETURNS INTEGER AS $$
DECLARE v_id INTEGER;
BEGIN
    INSERT INTO paquete_turistico (
        nombre_paq, 
        descripcion_paq, 
        estado_paq, 
        millaje_paq, 
        costo_millas_paq, 
        huella_de_carbono_paq, 
        fk_cod_usuario
    )
    VALUES (
        p_name, 
        p_desc, 
        p_status, 
        p_millaje, 
        p_costo, 
        p_huella, 
        p_usuario_id
    )
    RETURNING cod INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;
