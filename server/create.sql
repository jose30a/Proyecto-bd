-- =============================================
-- 1. TABLAS MAESTRAS Y SEGURIDAD
-- =============================================

CREATE TABLE rol (
    cod SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL
);

CREATE TABLE privilegio (
    cod SERIAL PRIMARY KEY,
    descripcion_priv VARCHAR(100)
);

CREATE TABLE usuario (
    cod SERIAL PRIMARY KEY,
    email_usu VARCHAR(100) UNIQUE,
    password_usu VARCHAR(255),
    primer_nombre_usu VARCHAR(50) NOT NULL,
    segundo_nombre_usu VARCHAR(50),
    primer_apellido_usu VARCHAR(50) NOT NULL,
    segundo_apellido_usu VARCHAR(50),
    ci_usu VARCHAR(20) NOT NULL UNIQUE,
    tipo_documento VARCHAR(5) NOT NULL,
    n_pasaporte_usu VARCHAR(20) NOT NULL UNIQUE,
    visa_usu BOOLEAN,
    millas_acum_usu INTEGER,
    fk_cod_rol INTEGER REFERENCES rol(cod) -- Relación Usuario -> Rol
);

-- Tabla intermedia con PK compuesta
CREATE TABLE priv_rol (
    fk_cod_rol INTEGER NOT NULL REFERENCES rol(cod),
    fk_cod_privilegio INTEGER NOT NULL REFERENCES privilegio(cod),
    PRIMARY KEY (fk_cod_rol, fk_cod_privilegio)
);

CREATE TABLE auditoria (
    cod SERIAL PRIMARY KEY,
    descripcion TEXT NOT NULL
);

CREATE TABLE aud_usu (
    fecha_hora TIMESTAMP PRIMARY KEY,
    fk_usuario INTEGER REFERENCES usuario(cod),
    fk_auditoria INTEGER REFERENCES auditoria(cod)
);

-- =============================================
-- 2. UBICACIÓN Y ESTRUCTURA GEOGRÁFICA
-- =============================================

CREATE TABLE lugar (
    cod_lug SERIAL PRIMARY KEY,
    nombre_lug VARCHAR(100) NOT NULL,
    tipo_lug VARCHAR(50) NOT NULL,
    fk_cod_lug_padre INTEGER REFERENCES lugar(cod_lug) -- Auto-relación
);

CREATE TABLE terminal (
    cod SERIAL PRIMARY KEY,
    nombre_ter VARCHAR(100) NOT NULL,
    tipo_ter VARCHAR(50) NOT NULL,
    fk_cod_lug INTEGER REFERENCES lugar(cod_lug)
);

-- =============================================
-- 3. PROVEEDORES Y SERVICIOS BASE
-- =============================================

CREATE TABLE aerolinea (
    cod SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    f_inicio_servicio_prov DATE NOT NULL,
    servicio_aer VARCHAR(100) NOT NULL,
    origen_aer VARCHAR(50) NOT NULL,
    fk_cod_lug INTEGER REFERENCES lugar(cod_lug)
);

CREATE TABLE crucero (
    cod SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    f_inicio_servicio_prov DATE NOT NULL,
    origen_cru VARCHAR(50) NOT NULL,
    fk_cod_lug INTEGER REFERENCES lugar(cod_lug)
);

CREATE TABLE terrestre (
    cod SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    f_inicio_servicio_prov DATE NOT NULL,
    fk_cod_lug INTEGER REFERENCES lugar(cod_lug)
);

CREATE TABLE turistico ( -- Nombre corregido
    cod SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    f_inicio_servicio_prov DATE NOT NULL,
    tipo_servicio_tur VARCHAR(50) NOT NULL,
    fk_cod_lug INTEGER REFERENCES lugar(cod_lug)
);

CREATE TABLE hotel (
    cod SERIAL PRIMARY KEY,
    nombre_hot VARCHAR(100) NOT NULL,
    direccion_hot VARCHAR(200) NOT NULL,
    tipo_hot VARCHAR(50) NOT NULL,  
    fk_cod_lug INTEGER REFERENCES lugar(cod_lug)
);

CREATE TABLE restaurant (
    cod SERIAL PRIMARY KEY,
    nombre_res VARCHAR(100) NOT NULL,
    tipo_res VARCHAR(50) NOT NULL,
    ambiente_res VARCHAR(50) NOT NULL,
    calificacion_res INTEGER NOT NULL,
    fk_cod_lug INTEGER REFERENCES lugar(cod_lug)
);

-- =============================================
-- 4. DETALLES DE TRANSPORTE (FLOTA)
-- =============================================

CREATE TABLE aeronave (
    cod SERIAL PRIMARY KEY,
    tipo_aer VARCHAR(50) NOT NULL,
    capacidad_tra INTEGER NOT NULL,
    nombre_tra VARCHAR(100) NOT NULL,
    fk_cod_aerolinea INTEGER REFERENCES aerolinea(cod)
);

CREATE TABLE barco (
    cod SERIAL PRIMARY KEY,
    capacidad_tra INTEGER NOT NULL,
    nombre_tra VARCHAR(100) NOT NULL,
    fk_cod_crucero INTEGER REFERENCES crucero(cod)
);

CREATE TABLE vehiculo (
    cod SERIAL PRIMARY KEY,
    capacidad_tra INTEGER NOT NULL,
    nombre_tra VARCHAR(100) NOT NULL,
    fk_cod_terrestre INTEGER REFERENCES terrestre(cod)
);

-- =============================================
-- 5. SERVICIOS Y PAQUETES
-- =============================================

CREATE TABLE servicio (
    cod SERIAL PRIMARY KEY,
    nombre_ser VARCHAR(100) NOT NULL,
    capacidad_ser INTEGER NOT NULL,
    numero_ser VARCHAR(50) NOT NULL,
    fk_cod_terminal_llega INTEGER REFERENCES terminal(cod),
    fk_cod_terminal_sale INTEGER REFERENCES terminal(cod)
);

CREATE TABLE tasa_cambio (
    cod SERIAL PRIMARY KEY,
    moneda VARCHAR(3) NOT NULL,
    tasa_bs DECIMAL(10,4) NOT NULL,
    fecha_hora_tas TIMESTAMP NOT NULL
);

CREATE TABLE plan_pago (
    cod SERIAL PRIMARY KEY,
    nombre_pla VARCHAR(50) NOT NULL,
    porcen_inicial DECIMAL(5,2) NOT NULL,
    frecuencia_pago VARCHAR(20) NOT NULL
);

CREATE TABLE paquete_turistico (
    cod SERIAL PRIMARY KEY,
    nombre_paq VARCHAR(100) NOT NULL,
    descripcion_paq TEXT NOT NULL,
    estado_paq VARCHAR(20) NOT NULL,
    costo_millas_paq INTEGER,
    millaje_paq INTEGER NOT NULL,
    huella_de_carbono_paq DECIMAL(10,2) NOT NULL,   
    fk_cod_tasa_cambio INTEGER REFERENCES tasa_cambio(cod),
    fk_cod_usuario INTEGER REFERENCES usuario(cod),
    fk_cod_plan_pago INTEGER REFERENCES plan_pago(cod)
);

-- =============================================
-- 6. RELACIONES PRINCIPALES (TABLAS INTERMEDIAS)
-- =============================================

CREATE TABLE ser_paq (
    cod SERIAL PRIMARY KEY,
    fk_servicio INTEGER NOT NULL REFERENCES servicio(cod),
    fk_paquete INTEGER NOT NULL REFERENCES paquete_turistico(cod),
    costo_ser DECIMAL(10,2) NOT NULL,
    inicio_ser DATE NOT NULL,
    fin_ser DATE NOT NULL,
    millaje_ser INTEGER NOT NULL
);

CREATE TABLE hot_paq (
    cod SERIAL PRIMARY KEY,
    fk_hotel INTEGER NOT NULL REFERENCES hotel(cod),
    fk_paquete INTEGER NOT NULL REFERENCES paquete_turistico(cod),
    numero_habitacion_hot VARCHAR(10) NOT NULL,
    inicio_estadia_hot DATE NOT NULL,
    fin_estadia_hot DATE NOT NULL,
    millaje_hot INTEGER NOT NULL,
    costo_reserva_hot DECIMAL(10,2) NOT NULL
);

CREATE TABLE res_paq (
    cod SERIAL PRIMARY KEY,
    fk_restaurant INTEGER NOT NULL REFERENCES restaurant(cod),
    fk_paquete INTEGER NOT NULL REFERENCES paquete_turistico(cod),
    numero_reservacion_res VARCHAR(50) NOT NULL,
    inicio_reserva_res DATE NOT NULL,
    fin_reserva_res DATE NOT NULL,
    millaje_res INTEGER NOT NULL,
    costo_reserva_res DECIMAL(10,2) NOT NULL
);

-- Relaciones Servicio-Transporte
CREATE TABLE ser_aer (
    fk_servicio INTEGER REFERENCES servicio(cod),
    fk_aerolinea INTEGER REFERENCES aerolinea(cod)
);

CREATE TABLE ser_cru (
    fk_servicio INTEGER REFERENCES servicio(cod),
    fk_crucero INTEGER REFERENCES crucero(cod)
);

CREATE TABLE ser_veh (
    fk_servicio INTEGER REFERENCES servicio(cod),
    fk_vehiculo INTEGER REFERENCES vehiculo(cod)
);

-- =============================================
-- 7. FINANZAS (PAGOS Y MÉTODOS)
-- =============================================

CREATE TABLE metodoDePago (
    cod SERIAL PRIMARY KEY,
    descripcion_met VARCHAR(50) NOT NULL,
    
    -- FK hacia el usuario (Un método pertenece a un usuario)
    fk_usuario INTEGER NOT NULL REFERENCES usuario(cod),

    -- Atributos de subtipos (Single Table Inheritance)
    tipoMetodo VARCHAR(20) NOT NULL CHECK (tipoMetodo IN ('USDt', 'PagoMovil', 'DepositoBancario', 'TransferenciaBancaria', 'TarjetaCreditoDebito', 'Cheque', 'Zelle', 'Milla')),

    -- Campos específicos
    id_usd VARCHAR(50) UNIQUE,
    f_hora_usd TIMESTAMP,
    billetera_usd VARCHAR(100),

    n_ref_pag VARCHAR(50),
    f_hora_pag TIMESTAMP,

    n_ref_dep VARCHAR(50),
    n_destino_dep VARCHAR(50),
    banco_dep VARCHAR(50),
    fecha_dep DATE,

    n_ref_tra VARCHAR(50),
    f_hora_tra TIMESTAMP,

    n_tarjeta_tar VARCHAR(16),
    tipo_tar VARCHAR(20),
    cod_seg_tar VARCHAR(4),
    banco_tar VARCHAR(50),
    f_venc_tar DATE,
    titular_tar VARCHAR(100), 

    n_cheque_che VARCHAR(50),
    cod_cuenta_che VARCHAR(50),
    titular_che VARCHAR(100), 
    bancoemisor_che VARCHAR(50),
    f_emision_che DATE,

    n_confirm_zel VARCHAR(50),
    f_hora_zel TIMESTAMP,

    -- Registro de milla como transacción
    M_ID_Mil INTEGER UNIQUE
);

CREATE TABLE pago (
    cod SERIAL PRIMARY KEY,
    monto_pago DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL,
    fk_cod_paquete INTEGER REFERENCES paquete_turistico(cod),
    -- Relación 1 a 1: Un pago corresponde a un uso de método específico
    fk_metodo_pago INTEGER NOT NULL UNIQUE REFERENCES metodoDePago(cod)
);

-- =============================================
-- 8. AUXILIARES, RECLAMOS Y CONTACTO
-- =============================================

CREATE TABLE telefono (
    cod SERIAL PRIMARY KEY,
    cod_area_tel VARCHAR(5),
    numero_tel VARCHAR(15),
    tipo_tel VARCHAR(20),
    fk_cod_aer INTEGER REFERENCES aerolinea(cod),
    fk_cod_cru INTEGER REFERENCES crucero(cod),
    fk_cod_ter INTEGER REFERENCES terrestre(cod),
    fk_cod_tur INTEGER REFERENCES turistico(cod)
);

CREATE TABLE deseo (
    cod SERIAL PRIMARY KEY,
    descripcion_des VARCHAR(255),
    fk_cod_usuario INTEGER REFERENCES usuario(cod),
    fk_cod_paquete INTEGER REFERENCES paquete_turistico(cod),
    fk_cod_lugar INTEGER REFERENCES lugar(cod_lug),
    fk_cod_servicio INTEGER REFERENCES servicio(cod)
);

CREATE TABLE reclamo (
    cod SERIAL PRIMARY KEY,
    descripcion_rec TEXT NOT NULL,
    estado_rec VARCHAR(20) NOT NULL,
    fk_cod_usuario INTEGER REFERENCES usuario(cod),
    fk_cod_hotel INTEGER REFERENCES hotel(cod),
    fk_cod_paquete INTEGER REFERENCES paquete_turistico(cod),
    fk_cod_lugar INTEGER REFERENCES lugar(cod_lug),
    
    fk_res_paq INTEGER REFERENCES res_paq(cod), 
    fk_ser_paq INTEGER REFERENCES ser_paq(cod)  
);

CREATE TABLE reseña (
    cod SERIAL PRIMARY KEY,
    descripcion_res TEXT NOT NULL,
    rating_res INTEGER NOT NULL,
    fk_cod_usuario INTEGER REFERENCES usuario(cod),
    fk_cod_lugar INTEGER REFERENCES lugar(cod_lug),
    fk_cod_hotel INTEGER REFERENCES hotel(cod),
    fk_cod_paquete INTEGER REFERENCES paquete_turistico(cod),
    
    fk_ser_paq INTEGER REFERENCES ser_paq(cod)
);

CREATE TABLE promocion (
    cod SERIAL PRIMARY KEY,
    tipo_pro VARCHAR(50) NOT NULL,
    porcen_descuento DECIMAL(5,2) NOT NULL
);

CREATE TABLE preferencia (
    cod SERIAL PRIMARY KEY,
    descripcion_pre VARCHAR(100) NOT NULL
);

CREATE TABLE tag (
    cod SERIAL PRIMARY KEY,
    nombre_tag VARCHAR(50) NOT NULL,
    condicion1_tag VARCHAR(255) NOT NULL,
    condicional_tag VARCHAR(20) NOT NULL,
    condicion2_tag VARCHAR(255) NOT NULL,
    restriccion_tag BOOLEAN
);

-- =============================================
-- 9. TABLAS MUCHOS A MUCHOS (RESTANTES)
-- =============================================

CREATE TABLE tag_paq (
    fk_tag INTEGER REFERENCES tag(cod),
    fk_paquete INTEGER REFERENCES paquete_turistico(cod),
    PRIMARY KEY (fk_tag, fk_paquete) 
);

CREATE TABLE tag_usu (
    fk_tag INTEGER REFERENCES tag(cod),
    fk_usuario INTEGER REFERENCES usuario(cod),
    PRIMARY KEY (fk_tag, fk_usuario)
);

CREATE TABLE paq_paq (
    fk_paquete_padre INTEGER REFERENCES paquete_turistico(cod),
    fk_paquete_hijo INTEGER REFERENCES paquete_turistico(cod)
);

CREATE TABLE tur_ser (
    fk_turistico INTEGER REFERENCES turistico(cod),
    fk_servicio INTEGER REFERENCES servicio(cod)
);

CREATE TABLE pre_usu (
    fk_preferencia INTEGER REFERENCES preferencia(cod),
    fk_usuario INTEGER REFERENCES usuario(cod)
);

CREATE TABLE pro_ser (
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    fk_promocion INTEGER REFERENCES promocion(cod),
    fk_servicio INTEGER REFERENCES servicio(cod)
);

-- =============================================
-- STORED PROCEDURES AND FUNCTIONS
-- =============================================

-- Function to authenticate user by email and password
-- Returns user data as a table (using function for easier calling from API)
CREATE OR REPLACE FUNCTION authenticate_user(
    p_email VARCHAR,
    p_password VARCHAR
)
RETURNS TABLE (
    p_cod INTEGER,
    p_email_usu VARCHAR,
    p_primer_nombre_usu VARCHAR,
    p_segundo_nombre_usu VARCHAR,
    p_primer_apellido_usu VARCHAR,
    p_segundo_apellido_usu VARCHAR,
    p_nombre_rol VARCHAR,
    p_fk_cod_rol INTEGER
) AS $$
BEGIN
    -- Return user data if email and password match (plain text comparison)
    RETURN QUERY
    SELECT 
        u.cod,
        u.email_usu,
        u.primer_nombre_usu,
        u.segundo_nombre_usu,
        u.primer_apellido_usu,
        u.segundo_apellido_usu,
        r.nombre_rol,
        u.fk_cod_rol
    FROM usuario u
    INNER JOIN rol r ON u.fk_cod_rol = r.cod
    WHERE u.email_usu = p_email
      AND u.password_usu = p_password;
    
    -- If no user found, raise exception
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid email or password';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get user by ID
CREATE OR REPLACE FUNCTION get_user_by_id(
    p_user_id INTEGER
)
RETURNS TABLE (
    p_cod INTEGER,
    p_email_usu VARCHAR,
    p_primer_nombre_usu VARCHAR,
    p_segundo_nombre_usu VARCHAR,
    p_primer_apellido_usu VARCHAR,
    p_segundo_apellido_usu VARCHAR,
    p_nombre_rol VARCHAR,
    p_fk_cod_rol INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.cod,
        u.email_usu,
        u.primer_nombre_usu,
        u.segundo_nombre_usu,
        u.primer_apellido_usu,
        u.segundo_apellido_usu,
        r.nombre_rol,
        u.fk_cod_rol
    FROM usuario u
    INNER JOIN rol r ON u.fk_cod_rol = r.cod
    WHERE u.cod = p_user_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check if email exists
CREATE OR REPLACE FUNCTION email_exists(
    p_email VARCHAR
)
RETURNS TABLE (p_exists BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT EXISTS(
        SELECT 1 FROM usuario WHERE email_usu = p_email
    ) AS p_exists;
END;
$$ LANGUAGE plpgsql;

-- Procedure to register a new user (using procedure for INSERT operation)
CREATE OR REPLACE PROCEDURE register_user(
    p_email VARCHAR,
    p_password VARCHAR,
    p_primer_nombre VARCHAR,
    p_segundo_nombre VARCHAR,
    p_primer_apellido VARCHAR,
    p_segundo_apellido VARCHAR,
    p_ci VARCHAR,
    p_tipo_documento VARCHAR,
    p_n_pasaporte VARCHAR,
    p_fk_cod_rol INTEGER
) AS $$
DECLARE
    v_email_exists BOOLEAN;
BEGIN
    -- Check if email already exists
    SELECT EXISTS(SELECT 1 FROM usuario WHERE email_usu = p_email) INTO v_email_exists;
    
    IF v_email_exists THEN
        RAISE EXCEPTION 'Email already registered';
    END IF;
    
    -- Insert new user (password stored as plain text)
    INSERT INTO usuario (
        email_usu,
        password_usu,
        primer_nombre_usu,
        segundo_nombre_usu,
        primer_apellido_usu,
        segundo_apellido_usu,
        ci_usu,
        tipo_documento,
        n_pasaporte_usu,
        fk_cod_rol
    ) VALUES (
        p_email,
        p_password,
        p_primer_nombre,
        p_segundo_nombre,
        p_primer_apellido,
        p_segundo_apellido,
        p_ci,
        p_tipo_documento,
        p_n_pasaporte,
        COALESCE(p_fk_cod_rol, 2) -- Default to 'Cliente' role if NULL
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE update_user_password(
    p_email VARCHAR,
    p_old_password VARCHAR,
    p_new_password VARCHAR
) AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    -- Update password if old password matches (plain text comparison)
    UPDATE usuario
    SET password_usu = p_new_password
    WHERE email_usu = p_email
      AND password_usu = p_old_password;
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    
    IF v_updated = 0 THEN
        RAISE EXCEPTION 'Invalid email or current password';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to return a list of users for management UI
-- Ensure no conflicting function signature exists before creating
DROP FUNCTION IF EXISTS get_all_users() CASCADE;
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
    p_cod INTEGER,
    p_primer_nombre_usu VARCHAR,
    p_segundo_nombre_usu VARCHAR,
    p_primer_apellido_usu VARCHAR,
    p_segundo_apellido_usu VARCHAR,
    p_ci_usu VARCHAR,
    p_email_usu VARCHAR,
    p_nombre_rol VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.cod,
        u.primer_nombre_usu,
        u.segundo_nombre_usu,
        u.primer_apellido_usu,
        u.segundo_apellido_usu,
        u.ci_usu,
        u.email_usu,
        r.nombre_rol
    FROM usuario u
    LEFT JOIN rol r ON u.fk_cod_rol = r.cod
    ORDER BY u.cod;
END;
$$ LANGUAGE plpgsql;

-- Procedure to update a user's role
-- Ensure no conflicting procedure exists before creating
DROP PROCEDURE IF EXISTS update_user_role(INTEGER, VARCHAR) CASCADE;
CREATE OR REPLACE PROCEDURE update_user_role(
    p_user_id INTEGER,
    p_role_name VARCHAR
) AS $$
DECLARE
    v_role_id INTEGER;
    v_updated INTEGER;
BEGIN
    -- Find role id (create role if it does not exist)
    SELECT cod INTO v_role_id FROM rol WHERE nombre_rol = p_role_name LIMIT 1;
    IF v_role_id IS NULL THEN
        INSERT INTO rol (nombre_rol) VALUES (p_role_name) RETURNING cod INTO v_role_id;
    END IF;

    UPDATE usuario SET fk_cod_rol = v_role_id WHERE cod = p_user_id;
    GET DIAGNOSTICS v_updated = ROW_COUNT;

    IF v_updated = 0 THEN
        RAISE EXCEPTION 'User with id % not found', p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Packages (paquete_turistico)
-- =============================================
DROP FUNCTION IF EXISTS get_all_packages() CASCADE;
CREATE OR REPLACE FUNCTION get_all_packages()
RETURNS TABLE (
    p_cod INTEGER,
    p_nombre_paq VARCHAR,
    p_descripcion_paq TEXT,
    p_estado_paq VARCHAR,
    p_millaje_paq INTEGER,
    p_costo_millas_paq INTEGER,
    p_huella_de_carbono_paq DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT cod, nombre_paq, descripcion_paq, estado_paq, millaje_paq, costo_millas_paq, huella_de_carbono_paq
    FROM paquete_turistico
    ORDER BY cod;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS upsert_package(INTEGER, VARCHAR, TEXT, VARCHAR, INTEGER, INTEGER, DECIMAL) CASCADE;
CREATE OR REPLACE PROCEDURE upsert_package(
    p_id INTEGER,
    p_name VARCHAR,
    p_description TEXT,
    p_status VARCHAR,
    p_millaje INTEGER,
    p_costo_millas INTEGER,
    p_huella DECIMAL
)
AS $$
BEGIN
    IF p_id IS NULL THEN
        INSERT INTO paquete_turistico (nombre_paq, descripcion_paq, estado_paq, millaje_paq, costo_millas_paq, huella_de_carbono_paq)
        VALUES (p_name, p_description, COALESCE(p_status, 'Active'), COALESCE(p_millaje,0), COALESCE(p_costo_millas,0), COALESCE(p_huella,0));
    ELSE
        UPDATE paquete_turistico
        SET nombre_paq = p_name,
            descripcion_paq = p_description,
            estado_paq = COALESCE(p_status, estado_paq),
            millaje_paq = COALESCE(p_millaje, millaje_paq),
            costo_millas_paq = COALESCE(p_costo_millas, costo_millas_paq),
            huella_de_carbono_paq = COALESCE(p_huella, huella_de_carbono_paq)
        WHERE cod = p_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS delete_package(INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE delete_package(p_id INTEGER) AS $$
BEGIN
    DELETE FROM paquete_turistico WHERE cod = p_id;
END;
$$ LANGUAGE plpgsql;

-- Return services, hotels and restaurants included in a package
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
    -- Services from ser_paq join servicio
    RETURN QUERY
    SELECT 'service'::VARCHAR AS item_type, s.cod AS item_id, s.nombre_ser AS item_name, sp.inicio_ser AS inicio, sp.fin_ser AS fin, sp.costo_ser::DECIMAL AS costo, sp.millaje_ser AS millaje
    FROM ser_paq sp
    JOIN servicio s ON sp.fk_servicio = s.cod
    WHERE sp.fk_paquete = p_package_id
    UNION ALL
    -- Hotels from hot_paq join hotel
    SELECT 'hotel'::VARCHAR, h.cod, h.nombre_hot, hp.inicio_estadia_hot, hp.fin_estadia_hot, hp.costo_reserva_hot::DECIMAL, hp.millaje_hot
    FROM hot_paq hp
    JOIN hotel h ON hp.fk_hotel = h.cod
    WHERE hp.fk_paquete = p_package_id
    UNION ALL
    -- Restaurants from res_paq join restaurant
    SELECT 'restaurant'::VARCHAR, r.cod, r.nombre_res, rp.inicio_reserva_res, rp.fin_reserva_res, rp.costo_reserva_res::DECIMAL, rp.millaje_res
    FROM res_paq rp
    JOIN restaurant r ON rp.fk_restaurant = r.cod
    WHERE rp.fk_paquete = p_package_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Promotions
-- =============================================
DROP FUNCTION IF EXISTS get_all_promotions() CASCADE;
CREATE OR REPLACE FUNCTION get_all_promotions()
RETURNS TABLE (p_cod INTEGER, p_tipo_pro VARCHAR, p_porcen_descuento DECIMAL) AS $$
BEGIN
    RETURN QUERY SELECT cod, tipo_pro, porcen_descuento FROM promocion ORDER BY cod;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS upsert_promotion(INTEGER, VARCHAR) CASCADE;
CREATE OR REPLACE PROCEDURE upsert_promotion(p_id INTEGER, p_tipo VARCHAR, p_porcen_descuento DECIMAL) AS $$
BEGIN
    IF p_id IS NULL THEN
        INSERT INTO promocion (tipo_pro, porcen_descuento) VALUES (p_tipo, COALESCE(p_porcen_descuento,0));
    ELSE
        UPDATE promocion SET tipo_pro = p_tipo, porcen_descuento = COALESCE(p_porcen_descuento, porcen_descuento) WHERE cod = p_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS delete_promotion(INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE delete_promotion(p_id INTEGER) AS $$
BEGIN
    DELETE FROM promocion WHERE cod = p_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Airlines helpers
-- =============================================
DROP FUNCTION IF EXISTS get_all_airlines() CASCADE;
CREATE OR REPLACE FUNCTION get_all_airlines()
RETURNS TABLE (p_cod INTEGER, p_nombre VARCHAR, p_origen_aer VARCHAR, p_fk_cod_lug INTEGER, p_lugar_nombre VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT a.cod, a.nombre, a.origen_aer, a.fk_cod_lug, l.nombre_lug
    FROM aerolinea a
    LEFT JOIN lugar l ON a.fk_cod_lug = l.cod_lug
    ORDER BY a.cod;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_airline_contacts(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_airline_contacts(p_airline_id INTEGER)
RETURNS TABLE (p_cod INTEGER, p_cod_area VARCHAR, p_numero VARCHAR, p_tipo VARCHAR) AS $$
BEGIN
    RETURN QUERY SELECT cod, cod_area_tel, numero_tel, tipo_tel FROM telefono WHERE fk_cod_aer = p_airline_id ORDER BY cod;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS upsert_airline(INTEGER, VARCHAR, DATE, VARCHAR, INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE upsert_airline(p_id INTEGER, p_name VARCHAR, p_f_inicio DATE, p_servicio VARCHAR, p_origen VARCHAR, p_fk_cod_lug INTEGER DEFAULT NULL) AS $$
BEGIN
    IF p_id IS NULL THEN
        INSERT INTO aerolinea (nombre, f_inicio_servicio_prov, servicio_aer, origen_aer, fk_cod_lug)
        VALUES (p_name, p_f_inicio, p_servicio, p_origen, p_fk_cod_lug);
    ELSE
        UPDATE aerolinea SET nombre = p_name, f_inicio_servicio_prov = p_f_inicio, servicio_aer = p_servicio, origen_aer = p_origen, fk_cod_lug = p_fk_cod_lug WHERE cod = p_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS delete_airline(INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE delete_airline(p_id INTEGER) AS $$
BEGIN
    DELETE FROM aerolinea WHERE cod = p_id;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS upsert_contact_number(INTEGER, INTEGER, VARCHAR, VARCHAR, VARCHAR) CASCADE;
CREATE OR REPLACE PROCEDURE upsert_contact_number(p_id INTEGER, p_airline_id INTEGER, p_cod_area VARCHAR, p_numero VARCHAR, p_tipo VARCHAR) AS $$
BEGIN
    IF p_id IS NULL THEN
        INSERT INTO telefono (cod_area_tel, numero_tel, tipo_tel, fk_cod_aer) VALUES (p_cod_area, p_numero, p_tipo, p_airline_id);
    ELSE
        UPDATE telefono SET cod_area_tel = p_cod_area, numero_tel = p_numero, tipo_tel = p_tipo, fk_cod_aer = p_airline_id WHERE cod = p_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Reports (basic implementations)
-- =============================================
DROP FUNCTION IF EXISTS get_negative_reviews(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_negative_reviews(p_start DATE, p_end DATE)
RETURNS TABLE (p_id INTEGER, p_date DATE, p_hotel_name VARCHAR, p_rating INTEGER, p_comment TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT r.cod, CURRENT_DATE::DATE, COALESCE(h.nombre_hot, 'Unknown'), r.rating_res, r.descripcion_res
    FROM reseña r
    LEFT JOIN hotel h ON r.fk_cod_hotel = h.cod
    WHERE r.rating_res <= 2
      AND (p_start IS NULL OR CURRENT_DATE >= p_start)
      AND (p_end IS NULL OR CURRENT_DATE <= p_end)
    ORDER BY r.cod DESC;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_exchange_rates_history(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_exchange_rates_history(p_start DATE, p_end DATE)
RETURNS TABLE (p_fecha TIMESTAMP, p_moneda VARCHAR, p_tasa_bs DECIMAL) AS $$
BEGIN
    RETURN QUERY SELECT fecha_hora_tas, moneda, tasa_bs FROM tasa_cambio
    WHERE (p_start IS NULL OR fecha_hora_tas::date >= p_start)
      AND (p_end IS NULL OR fecha_hora_tas::date <= p_end)
    ORDER BY fecha_hora_tas;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_operator_performance(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_operator_performance(p_start DATE, p_end DATE)
RETURNS TABLE (p_rank INTEGER, p_operator VARCHAR, p_revenue DECIMAL, p_service_cost DECIMAL, p_duration TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(pay.monto_pago),0) DESC) AS p_rank,
           COALESCE(pt.nombre_paq, 'Unknown') AS p_operator,
           COALESCE(SUM(pay.monto_pago),0) AS p_revenue,
           0::DECIMAL AS p_service_cost,
           'N/A'::TEXT
    FROM paquete_turistico pt
    LEFT JOIN pago pay ON pay.fk_cod_paquete = pt.cod
    GROUP BY pt.nombre_paq
    ORDER BY p_revenue DESC;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_refunds_audit(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_refunds_audit(p_start DATE, p_end DATE)
RETURNS TABLE (p_reservation_id VARCHAR, p_total_amount DECIMAL, p_penalty DECIMAL, p_refund_amount DECIMAL, p_process_date DATE) AS $$
BEGIN
    -- No refund table available; return empty set for now
    RETURN QUERY SELECT ''::VARCHAR, 0::DECIMAL, 0::DECIMAL, 0::DECIMAL, NULL::DATE WHERE FALSE;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_customer_age_distribution(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_customer_age_distribution(p_start DATE, p_end DATE)
RETURNS TABLE (p_range VARCHAR, p_count INTEGER) AS $$
BEGIN
    -- Age data not stored; return empty
    RETURN QUERY SELECT ''::VARCHAR, 0::INTEGER WHERE FALSE;
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_customer_average_age(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_customer_average_age(p_start DATE, p_end DATE)
RETURNS TABLE (p_avg NUMERIC) AS $$
BEGIN
    RETURN QUERY SELECT 0::NUMERIC;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Convenience triggers: create related parents on insert
-- =============================================

-- BEFORE INSERT/UPDATE for aerolinea: ensure lugar exists and set fk
DROP FUNCTION IF EXISTS before_upsert_aerolinea() CASCADE;
CREATE OR REPLACE FUNCTION before_upsert_aerolinea()
RETURNS trigger AS $$
DECLARE
    v_lug INTEGER;
BEGIN
    IF NEW.fk_cod_lug IS NOT NULL THEN
        RETURN NEW;
    END IF;

    IF NEW.origen_aer IS NOT NULL AND TRIM(NEW.origen_aer) <> '' THEN
        SELECT cod_lug INTO v_lug FROM lugar WHERE nombre_lug = NEW.origen_aer LIMIT 1;
        IF v_lug IS NULL THEN
            INSERT INTO lugar (nombre_lug, tipo_lug) VALUES (NEW.origen_aer, 'City') RETURNING cod_lug INTO v_lug;
        END IF;
        NEW.fk_cod_lug := v_lug;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_before_upsert_aerolinea ON aerolinea;
CREATE TRIGGER trg_before_upsert_aerolinea
BEFORE INSERT OR UPDATE ON aerolinea
FOR EACH ROW EXECUTE FUNCTION before_upsert_aerolinea();

-- BEFORE INSERT for paquete_turistico: ensure default plan, tasa_cambio, and user exist
DROP FUNCTION IF EXISTS before_insert_paquete_turistico() CASCADE;
CREATE OR REPLACE FUNCTION before_insert_paquete_turistico()
RETURNS trigger AS $$
DECLARE
    v_plan INTEGER;
    v_tasa INTEGER;
    v_user INTEGER;
BEGIN
    IF NEW.fk_cod_plan_pago IS NULL THEN
        SELECT cod INTO v_plan FROM plan_pago WHERE nombre_pla = 'Default' LIMIT 1;
        IF v_plan IS NULL THEN
            INSERT INTO plan_pago (nombre_pla, porcen_inicial, frecuencia_pago) VALUES ('Default', 0, 'One-time') RETURNING cod INTO v_plan;
        END IF;
        NEW.fk_cod_plan_pago := v_plan;
    END IF;

    IF NEW.fk_cod_tasa_cambio IS NULL THEN
        SELECT cod INTO v_tasa FROM tasa_cambio ORDER BY fecha_hora_tas DESC LIMIT 1;
        IF v_tasa IS NOT NULL THEN
            NEW.fk_cod_tasa_cambio := v_tasa;
        END IF;
    END IF;

    IF NEW.fk_cod_usuario IS NULL THEN
        SELECT cod INTO v_user FROM usuario ORDER BY cod LIMIT 1;
        IF v_user IS NOT NULL THEN
            NEW.fk_cod_usuario := v_user;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_before_insert_paquete ON paquete_turistico;
CREATE TRIGGER trg_before_insert_paquete
BEFORE INSERT ON paquete_turistico
FOR EACH ROW EXECUTE FUNCTION before_insert_paquete_turistico();

-- AFTER INSERT example: create placeholder promotion when first package inserted
DROP FUNCTION IF EXISTS after_insert_paquete_turistico() CASCADE;
CREATE OR REPLACE FUNCTION after_insert_paquete_turistico()
RETURNS trigger AS $$
DECLARE
    v_prom INTEGER;
BEGIN
    IF (SELECT COUNT(*) FROM promocion) = 0 THEN
        INSERT INTO promocion (tipo_pro, porcen_descuento) VALUES ('Launch', 0) RETURNING cod INTO v_prom;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_insert_paquete ON paquete_turistico;
CREATE TRIGGER trg_after_insert_paquete
AFTER INSERT ON paquete_turistico
FOR EACH ROW EXECUTE FUNCTION after_insert_paquete_turistico();