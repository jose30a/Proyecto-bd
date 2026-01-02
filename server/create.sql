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
    millas_acum_usu INTEGER DEFAULT 0,
    fecha_nacimiento DATE,
    fk_cod_rol INTEGER REFERENCES rol(cod) -- RelaciÃ³n Usuario -> Rol
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
    cod SERIAL PRIMARY KEY,
    fecha_hora TIMESTAMP NOT NULL DEFAULT now(),
    fk_usuario INTEGER REFERENCES usuario(cod),
    fk_auditoria INTEGER REFERENCES auditoria(cod)
);
-- =============================================
-- 2. UBICACIÃ“N Y ESTRUCTURA GEOGRÃFICA
-- =============================================
CREATE TABLE lugar (
    cod_lug SERIAL PRIMARY KEY,
    nombre_lug VARCHAR(100) NOT NULL,
    tipo_lug VARCHAR(50) NOT NULL,
    fk_cod_lug_padre INTEGER REFERENCES lugar(cod_lug) -- Auto-relaciÃ³n
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
CREATE TABLE turistico (
    -- Nombre corregido
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
    tasa_bs DECIMAL(10, 4) NOT NULL,
    fecha_hora_tas TIMESTAMP NOT NULL
);
CREATE TABLE plan_pago (
    cod SERIAL PRIMARY KEY,
    nombre_pla VARCHAR(50) NOT NULL,
    porcen_inicial DECIMAL(5, 2) NOT NULL,
    frecuencia_pago VARCHAR(20) NOT NULL
);
CREATE TABLE paquete_turistico (
    cod SERIAL PRIMARY KEY,
    nombre_paq VARCHAR(100) NOT NULL,
    descripcion_paq TEXT NOT NULL,
    estado_paq VARCHAR(20) NOT NULL,
    costo_millas_paq INTEGER,
    millaje_paq INTEGER NOT NULL,
    huella_de_carbono_paq DECIMAL(10, 2) NOT NULL,
    fecha_cancelacion DATE,
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
    costo_ser DECIMAL(10, 2) NOT NULL,
    inicio_ser DATE NOT NULL,
    fin_ser DATE NOT NULL,
    millaje_ser INTEGER NOT NULL,
    -- Passenger Details added as per user request
    nombre_pasajero VARCHAR(100),
    apellido_pasajero VARCHAR(100),
    n_pasaporte_pasajero VARCHAR(20),
    fecha_nacimiento_pasajero DATE
);
CREATE TABLE hot_paq (
    cod SERIAL PRIMARY KEY,
    fk_hotel INTEGER NOT NULL REFERENCES hotel(cod),
    fk_paquete INTEGER NOT NULL REFERENCES paquete_turistico(cod),
    numero_habitacion_hot VARCHAR(10) NOT NULL,
    inicio_estadia_hot DATE NOT NULL,
    fin_estadia_hot DATE NOT NULL,
    millaje_hot INTEGER NOT NULL,
    costo_reserva_hot DECIMAL(10, 2) NOT NULL
);
CREATE TABLE res_paq (
    cod SERIAL PRIMARY KEY,
    fk_restaurant INTEGER NOT NULL REFERENCES restaurant(cod),
    fk_paquete INTEGER NOT NULL REFERENCES paquete_turistico(cod),
    numero_reservacion_res VARCHAR(50) NOT NULL,
    inicio_reserva_res DATE NOT NULL,
    fin_reserva_res DATE NOT NULL,
    millaje_res INTEGER NOT NULL,
    costo_reserva_res DECIMAL(10, 2) NOT NULL
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
-- 7. FINANZAS (PAGOS Y MÃ‰TODOS)
-- =============================================
CREATE TABLE metodoDePago (
    cod SERIAL PRIMARY KEY,
    descripcion_met VARCHAR(50) NOT NULL,
    -- FK hacia el usuario (Un mÃ©todo pertenece a un usuario)
    fk_usuario INTEGER NOT NULL REFERENCES usuario(cod),
    -- Atributos de subtipos (Single Table Inheritance)
    tipoMetodo VARCHAR(20) NOT NULL CHECK (
        tipoMetodo IN (
            'USDt',
            'PagoMovil',
            'DepositoBancario',
            'TransferenciaBancaria',
            'TarjetaCreditoDebito',
            'Cheque',
            'Zelle',
            'Milla'
        )
    ),
    -- Campos especÃ­ficos
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
    -- Registro de milla como transacciÃ³n
    M_ID_Mil INTEGER UNIQUE
);
CREATE TABLE pago (
    cod SERIAL PRIMARY KEY,
    monto_pago DECIMAL(10, 2) NOT NULL,
    fecha_pago TIMESTAMP NOT NULL,
    fk_cod_paquete INTEGER REFERENCES paquete_turistico(cod),
    -- RelaciÃ³n 1 a 1: Un pago corresponde a un uso de mÃ©todo especÃ­fico
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
    porcen_descuento DECIMAL(5, 2) NOT NULL
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
CREATE OR REPLACE FUNCTION authenticate_user(p_email VARCHAR, p_password VARCHAR) RETURNS TABLE (
        p_cod INTEGER,
        p_email_usu VARCHAR,
        p_primer_nombre_usu VARCHAR,
        p_segundo_nombre_usu VARCHAR,
        p_primer_apellido_usu VARCHAR,
        p_segundo_apellido_usu VARCHAR,
        p_nombre_rol VARCHAR,
        p_fk_cod_rol INTEGER
    ) AS $$ BEGIN -- Return user data if email and password match (plain text comparison)
    RETURN QUERY
SELECT u.cod,
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
IF NOT FOUND THEN RAISE EXCEPTION 'Invalid email or password';
END IF;
END;
$$ LANGUAGE plpgsql;
-- Function to get user by ID
CREATE OR REPLACE FUNCTION get_user_by_id(p_user_id INTEGER) RETURNS TABLE (
        p_cod INTEGER,
        p_email_usu VARCHAR,
        p_primer_nombre_usu VARCHAR,
        p_segundo_nombre_usu VARCHAR,
        p_primer_apellido_usu VARCHAR,
        p_segundo_apellido_usu VARCHAR,
        p_nombre_rol VARCHAR,
        p_fk_cod_rol INTEGER
    ) AS $$ BEGIN RETURN QUERY
SELECT u.cod,
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
IF NOT FOUND THEN RAISE EXCEPTION 'User not found';
END IF;
END;
$$ LANGUAGE plpgsql;
-- Function to check if email exists
CREATE OR REPLACE FUNCTION email_exists(p_email VARCHAR) RETURNS TABLE (p_exists BOOLEAN) AS $$ BEGIN RETURN QUERY
SELECT EXISTS(
        SELECT 1
        FROM usuario
        WHERE email_usu = p_email
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
        p_visa BOOLEAN,
        p_fk_cod_rol INTEGER
    ) AS $$
DECLARE v_email_exists BOOLEAN;
BEGIN -- Check if email already exists
SELECT EXISTS(
        SELECT 1
        FROM usuario
        WHERE email_usu = p_email
    ) INTO v_email_exists;
IF v_email_exists THEN RAISE EXCEPTION 'Email already registered';
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
        visa_usu,
        fk_cod_rol
    )
VALUES (
        p_email,
        p_password,
        p_primer_nombre,
        p_segundo_nombre,
        p_primer_apellido,
        p_segundo_apellido,
        p_ci,
        p_tipo_documento,
        p_n_pasaporte,
        COALESCE(p_visa, false),
        COALESCE(p_fk_cod_rol, 2) -- Default to 'Cliente' role if NULL
    );
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE PROCEDURE update_user_password(
        p_email VARCHAR,
        p_old_password VARCHAR,
        p_new_password VARCHAR
    ) AS $$
DECLARE v_updated INTEGER;
BEGIN -- Update password if old password matches (plain text comparison)
UPDATE usuario
SET password_usu = p_new_password
WHERE email_usu = p_email
    AND password_usu = p_old_password;
GET DIAGNOSTICS v_updated = ROW_COUNT;
IF v_updated = 0 THEN RAISE EXCEPTION 'Invalid email or current password';
END IF;
END;
$$ LANGUAGE plpgsql;
-- Function to return a list of users for management UI
-- Ensure no conflicting function signature exists before creating
DROP FUNCTION IF EXISTS get_all_users() CASCADE;
CREATE OR REPLACE FUNCTION get_all_users() RETURNS TABLE (
        p_cod INTEGER,
        p_primer_nombre_usu VARCHAR,
        p_segundo_nombre_usu VARCHAR,
        p_primer_apellido_usu VARCHAR,
        p_segundo_apellido_usu VARCHAR,
        p_ci_usu VARCHAR,
        p_email_usu VARCHAR,
        p_nombre_rol VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT u.cod,
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
DECLARE v_role_id INTEGER;
v_updated INTEGER;
BEGIN -- Find role id (create role if it does not exist)
SELECT cod INTO v_role_id
FROM rol
WHERE nombre_rol = p_role_name
LIMIT 1;
IF v_role_id IS NULL THEN
INSERT INTO rol (nombre_rol)
VALUES (p_role_name)
RETURNING cod INTO v_role_id;
END IF;
UPDATE usuario
SET fk_cod_rol = v_role_id
WHERE cod = p_user_id;
GET DIAGNOSTICS v_updated = ROW_COUNT;
IF v_updated = 0 THEN RAISE EXCEPTION 'User with id % not found',
p_user_id;
END IF;
END;
$$ LANGUAGE plpgsql;
-- Procedure to update basic user details: email and names
DROP PROCEDURE IF EXISTS update_user_details(
    INTEGER,
    VARCHAR,
    VARCHAR,
    VARCHAR,
    VARCHAR,
    VARCHAR
) CASCADE;
CREATE OR REPLACE PROCEDURE update_user_details(
        p_user_id INTEGER,
        p_email VARCHAR,
        p_primer_nombre VARCHAR,
        p_segundo_nombre VARCHAR,
        p_primer_apellido VARCHAR,
        p_segundo_apellido VARCHAR
    ) AS $$
DECLARE v_updated INTEGER;
BEGIN
UPDATE usuario
SET email_usu = COALESCE(NULLIF(p_email, ''), email_usu),
    primer_nombre_usu = COALESCE(NULLIF(p_primer_nombre, ''), primer_nombre_usu),
    segundo_nombre_usu = COALESCE(p_segundo_nombre, segundo_nombre_usu),
    primer_apellido_usu = COALESCE(
        NULLIF(p_primer_apellido, ''),
        primer_apellido_usu
    ),
    segundo_apellido_usu = COALESCE(p_segundo_apellido, segundo_apellido_usu)
WHERE cod = p_user_id;
GET DIAGNOSTICS v_updated = ROW_COUNT;
IF v_updated = 0 THEN RAISE EXCEPTION 'User with id % not found',
p_user_id;
END IF;
END;
$$ LANGUAGE plpgsql;
-- Function: list all roles (for frontend consumption)
DROP FUNCTION IF EXISTS get_all_roles() CASCADE;
CREATE OR REPLACE FUNCTION get_all_roles() RETURNS TABLE(p_cod INTEGER, p_nombre_rol VARCHAR) AS $$ BEGIN RETURN QUERY
SELECT cod,
    nombre_rol
FROM rol
ORDER BY cod;
END;
$$ LANGUAGE plpgsql;
-- Audit: record role changes on usuario
DROP FUNCTION IF EXISTS audit_fn_usuario_update_role() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_usuario_update_role() RETURNS trigger AS $$ BEGIN -- Only record when role actually changed
    IF (
        OLD.fk_cod_rol IS DISTINCT
        FROM NEW.fk_cod_rol
    ) THEN PERFORM record_audit('Cambio de rol de usuario');
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_usuario_update_role ON usuario;
CREATE TRIGGER trg_usuario_update_role
AFTER
UPDATE ON usuario FOR EACH ROW
    WHEN (
        OLD.fk_cod_rol IS DISTINCT
        FROM NEW.fk_cod_rol
    ) EXECUTE FUNCTION audit_fn_usuario_update_role();
-- =============================================
-- Packages (paquete_turistico)
-- =============================================
DROP FUNCTION IF EXISTS get_all_packages() CASCADE;
CREATE OR REPLACE FUNCTION get_all_packages() RETURNS TABLE (
        p_cod INTEGER,
        p_nombre_paq VARCHAR,
        p_descripcion_paq TEXT,
        p_estado_paq VARCHAR,
        p_millaje_paq INTEGER,
        p_costo_millas_paq INTEGER,
        p_huella_de_carbono_paq DECIMAL
    ) AS $$ BEGIN RETURN QUERY
SELECT cod,
    nombre_paq,
    descripcion_paq,
    estado_paq,
    millaje_paq,
    costo_millas_paq,
    huella_de_carbono_paq
FROM paquete_turistico
ORDER BY cod;
END;
$$ LANGUAGE plpgsql;
DROP PROCEDURE IF EXISTS upsert_package(
    INTEGER,
    VARCHAR,
    TEXT,
    VARCHAR,
    INTEGER,
    INTEGER,
    DECIMAL
) CASCADE;
CREATE OR REPLACE PROCEDURE upsert_package(
        p_id INTEGER,
        p_name VARCHAR,
        p_description TEXT,
        p_status VARCHAR,
        p_millaje INTEGER,
        p_costo_millas INTEGER,
        p_huella DECIMAL
    ) AS $$ BEGIN IF p_id IS NULL THEN
INSERT INTO paquete_turistico (
        nombre_paq,
        descripcion_paq,
        estado_paq,
        millaje_paq,
        costo_millas_paq,
        huella_de_carbono_paq
    )
VALUES (
        p_name,
        p_description,
        COALESCE(p_status, 'Active'),
        COALESCE(p_millaje, 0),
        COALESCE(p_costo_millas, 0),
        COALESCE(p_huella, 0)
    );
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
CREATE OR REPLACE PROCEDURE delete_package(p_id INTEGER) AS $$ BEGIN -- Delete dependent associations (Many-to-Many & Details)
DELETE FROM ser_paq
WHERE fk_paquete = p_id;
DELETE FROM hot_paq
WHERE fk_paquete = p_id;
DELETE FROM res_paq
WHERE fk_paquete = p_id;
DELETE FROM tag_paq
WHERE fk_paquete = p_id;
DELETE FROM paq_paq
WHERE fk_paquete_padre = p_id
    OR fk_paquete_hijo = p_id;
-- Delete user interactions
DELETE FROM deseo
WHERE fk_cod_paquete = p_id;
DELETE FROM reclamo
WHERE fk_cod_paquete = p_id;
DELETE FROM reseña
WHERE fk_cod_paquete = p_id;
-- Update payments to detach them (preserve audit trail)
UPDATE pago
SET fk_cod_paquete = NULL
WHERE fk_cod_paquete = p_id;
-- Note: Payment (pago) is NOT deleted automatically to preserve financial history.
-- If a package has payments, deletion will still fail, which is intended behavior.
-- Finally delete the package
DELETE FROM paquete_turistico
WHERE cod = p_id;
END;
$$ LANGUAGE plpgsql;
-- Return services, hotels and restaurants included in a package
-- Fixed version of get_package_details function
-- This version works with the actual schema where hotels and restaurants
-- are linked via hot_paq and res_paq tables, not directly through servicio
DROP FUNCTION IF EXISTS get_package_details(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_package_details(p_package_id INTEGER) RETURNS TABLE (
        item_type VARCHAR,
        item_id INTEGER,
        item_name VARCHAR,
        inicio DATE,
        fin DATE,
        costo DECIMAL,
        millaje INTEGER
    ) AS $$ BEGIN RETURN QUERY -- Get services from ser_paq
SELECT 'service'::VARCHAR AS item_type,
    sp.fk_servicio AS item_id,
    COALESCE(s.nombre_ser, 'Unknown Service')::VARCHAR AS item_name,
    sp.inicio_ser AS inicio,
    sp.fin_ser AS fin,
    -- Dynamic Price Calculation: Apply discount if active promotion exists
    CASE
        WHEN p.porcen_descuento IS NOT NULL THEN sp.costo_ser * (1 - (p.porcen_descuento / 100))
        ELSE sp.costo_ser
    END AS costo,
    sp.millaje_ser AS millaje
FROM ser_paq sp
    LEFT JOIN servicio s ON sp.fk_servicio = s.cod -- Join with promotions to check for active discounts
    LEFT JOIN pro_ser ps ON s.cod = ps.fk_servicio
    AND sp.inicio_ser >= ps.fecha_inicio
    AND sp.fin_ser <= ps.fecha_fin
    LEFT JOIN promocion p ON ps.fk_promocion = p.cod
    AND p.porcen_descuento > 0
WHERE sp.fk_paquete = p_package_id
UNION ALL
-- Get hotels from hot_paq
SELECT 'hotel'::VARCHAR AS item_type,
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
SELECT 'restaurant'::VARCHAR AS item_type,
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
SELECT 'package'::VARCHAR AS item_type,
    pp.fk_paquete_hijo AS item_id,
    pt.nombre_paq::VARCHAR AS item_name,
    MIN(
        LEAST(
            (
                SELECT MIN(sp2.inicio_ser)
                FROM ser_paq sp2
                WHERE sp2.fk_paquete = pt.cod
            ),
            (
                SELECT MIN(hp2.inicio_estadia_hot)
                FROM hot_paq hp2
                WHERE hp2.fk_paquete = pt.cod
            ),
            (
                SELECT MIN(rp2.inicio_reserva_res)
                FROM res_paq rp2
                WHERE rp2.fk_paquete = pt.cod
            )
        )
    ) AS inicio,
    MAX(
        GREATEST(
            (
                SELECT MAX(sp2.fin_ser)
                FROM ser_paq sp2
                WHERE sp2.fk_paquete = pt.cod
            ),
            (
                SELECT MAX(hp2.fin_estadia_hot)
                FROM hot_paq hp2
                WHERE hp2.fk_paquete = pt.cod
            ),
            (
                SELECT MAX(rp2.fin_reserva_res)
                FROM res_paq rp2
                WHERE rp2.fk_paquete = pt.cod
            )
        )
    ) AS fin,
    COALESCE(
        (
            SELECT SUM(sp2.costo_ser)
            FROM ser_paq sp2
            WHERE sp2.fk_paquete = pt.cod
        ),
        0
    ) + COALESCE(
        (
            SELECT SUM(hp2.costo_reserva_hot)
            FROM hot_paq hp2
            WHERE hp2.fk_paquete = pt.cod
        ),
        0
    ) + COALESCE(
        (
            SELECT SUM(rp2.costo_reserva_res)
            FROM res_paq rp2
            WHERE rp2.fk_paquete = pt.cod
        ),
        0
    ) AS costo,
    (
        COALESCE(
            (
                SELECT SUM(sp2.millaje_ser)
                FROM ser_paq sp2
                WHERE sp2.fk_paquete = pt.cod
            ),
            0
        ) + COALESCE(
            (
                SELECT SUM(hp2.millaje_hot)
                FROM hot_paq hp2
                WHERE hp2.fk_paquete = pt.cod
            ),
            0
        ) + COALESCE(
            (
                SELECT SUM(rp2.millaje_res)
                FROM res_paq rp2
                WHERE rp2.fk_paquete = pt.cod
            ),
            0
        )
    )::INTEGER AS millaje
FROM paq_paq pp
    JOIN paquete_turistico pt ON pp.fk_paquete_hijo = pt.cod
WHERE pp.fk_paquete_padre = p_package_id
GROUP BY pp.fk_paquete_hijo,
    pt.nombre_paq,
    pt.cod;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- Promotions
-- =============================================
DROP FUNCTION IF EXISTS get_all_promotions() CASCADE;
CREATE OR REPLACE FUNCTION get_all_promotions() RETURNS TABLE (
        p_cod INTEGER,
        p_tipo_pro VARCHAR,
        p_porcen_descuento DECIMAL
    ) AS $$ BEGIN RETURN QUERY
SELECT cod,
    tipo_pro,
    porcen_descuento
FROM promocion
ORDER BY cod;
END;
$$ LANGUAGE plpgsql;
-- Create upsert_promotion with signature (TEXT, TEXT, INTEGER) to match backend call
-- Params: p_id (TEXT), p_tipo (TEXT), p_discount (INTEGER)
DROP PROCEDURE IF EXISTS upsert_promotion(INTEGER, VARCHAR, DECIMAL) CASCADE;
DROP PROCEDURE IF EXISTS upsert_promotion(TEXT, TEXT, TEXT) CASCADE;
DROP PROCEDURE IF EXISTS upsert_promotion(TEXT, TEXT, DECIMAL) CASCADE;
DROP PROCEDURE IF EXISTS upsert_promotion(TEXT, TEXT, INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE upsert_promotion(
        p_id TEXT,
        p_tipo TEXT,
        p_discount INTEGER
    ) AS $$
DECLARE v_id INTEGER;
BEGIN -- Convert TEXT to INTEGER for ID (handle NULL)
IF p_id IS NULL
OR p_id = ''
OR p_id = 'null' THEN v_id := NULL;
ELSE v_id := p_id::INTEGER;
END IF;
-- p_discount is already INTEGER, usable for DECIMAL column usually implies implicit cast or explicit cast
IF v_id IS NULL THEN -- Insert new promotion
INSERT INTO promocion (
        tipo_pro,
        porcen_descuento
    )
VALUES (
        p_tipo,
        p_discount::DECIMAL
    );
ELSE -- Update existing promotion
UPDATE promocion
SET tipo_pro = p_tipo,
    porcen_descuento = p_discount::DECIMAL
WHERE cod = v_id;
END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE upsert_promotion(
        p_id INTEGER,
        p_tipo TEXT,
        p_discount INTEGER
    ) AS $$
BEGIN
    CALL upsert_promotion(p_id::TEXT, p_tipo, p_discount);
END;
$$ LANGUAGE plpgsql;
DROP PROCEDURE IF EXISTS delete_promotion(INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE delete_promotion(p_id INTEGER) AS $$ BEGIN -- First delete all promotion-service associations
DELETE FROM pro_ser
WHERE fk_promocion = p_id;
-- Then delete the promotion itself
DELETE FROM promocion
WHERE cod = p_id;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- Airlines helpers
-- =============================================
DROP FUNCTION IF EXISTS get_all_airlines() CASCADE;
CREATE OR REPLACE FUNCTION get_all_airlines() RETURNS TABLE (
        p_cod INTEGER,
        p_nombre VARCHAR,
        p_origen_aer VARCHAR,
        -- 'Nacional' or 'Internacional'
        p_fk_cod_lug INTEGER,
        p_fk_lug_padre INTEGER,
        -- To help frontend identify country context
        p_lugar_nombre VARCHAR,
        p_servicio_aer VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT a.cod,
    a.nombre,
    a.origen_aer,
    a.fk_cod_lug,
    l.fk_cod_lug_padre,
    CASE
        WHEN p.nombre_lug IS NOT NULL THEN (p.nombre_lug || ', ' || l.nombre_lug)::VARCHAR
        ELSE l.nombre_lug
    END as nombre_lug,
    a.servicio_aer
FROM aerolinea a
    LEFT JOIN lugar l ON a.fk_cod_lug = l.cod_lug
    LEFT JOIN lugar p ON l.fk_cod_lug_padre = p.cod_lug
ORDER BY a.nombre;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS get_airline_contacts(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_airline_contacts(p_airline_id INTEGER) RETURNS TABLE (
        p_cod INTEGER,
        p_cod_area VARCHAR,
        p_numero VARCHAR,
        p_tipo VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT cod,
    cod_area_tel,
    numero_tel,
    tipo_tel
FROM telefono
WHERE fk_cod_aer = p_airline_id
ORDER BY cod;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- Helper: Get Countries and Cities
-- =============================================
CREATE OR REPLACE FUNCTION get_countries() RETURNS TABLE (
        cod_lug INTEGER,
        nombre_lug VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT l.cod_lug,
    l.nombre_lug
FROM lugar l
WHERE l.tipo_lug = 'Pais'
ORDER BY l.nombre_lug;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS get_cities(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_cities(p_country_id INTEGER) RETURNS TABLE (
        cod_lug INTEGER,
        nombre_lug VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT l.cod_lug,
    l.nombre_lug
FROM lugar l
WHERE l.fk_cod_lug_padre = p_country_id
ORDER BY l.nombre_lug;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- Upsert Airline (Refactored)
-- =============================================
DROP PROCEDURE IF EXISTS upsert_airline(INTEGER, VARCHAR, VARCHAR, INTEGER, VARCHAR) CASCADE;
DROP PROCEDURE IF EXISTS upsert_airline(INTEGER, VARCHAR, DATE, VARCHAR, INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS upsert_airline(TEXT, VARCHAR, VARCHAR, INTEGER, VARCHAR) CASCADE;
DROP PROCEDURE IF EXISTS upsert_airline(TEXT, VARCHAR, VARCHAR, INTEGER, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP ROUTINE IF EXISTS upsert_airline(INTEGER, VARCHAR, VARCHAR, INTEGER);

CREATE OR REPLACE FUNCTION upsert_airline(
        p_id INTEGER,
        p_name VARCHAR,
        p_origin_type VARCHAR,
        p_fk_lug INTEGER
    ) RETURNS INTEGER AS $$
BEGIN 
    RETURN upsert_airline(p_id::TEXT, p_name, p_origin_type, p_fk_lug);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_airline(
        p_id TEXT,
        p_name VARCHAR,
        p_origin_type VARCHAR,
        p_fk_lug INTEGER
    ) RETURNS INTEGER AS $$
DECLARE v_id INTEGER;
BEGIN -- Handle p_id as TEXT
IF p_id IS NULL
OR p_id = ''
OR p_id = 'null' THEN v_id := NULL;
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
        'Active',
        CURRENT_DATE,
        p_fk_lug
    ) RETURNING cod INTO v_id;
ELSE
UPDATE aerolinea
SET nombre = p_name,
    origen_aer = COALESCE(p_origin_type, origen_aer),
    fk_cod_lug = COALESCE(p_fk_lug, fk_cod_lug)
WHERE cod = v_id;
END IF;
RETURN v_id;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS delete_airline(INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE delete_airline(p_id INTEGER) AS $$ BEGIN -- First delete all airline-service associations
DELETE FROM ser_aer
WHERE fk_aerolinea = p_id;
-- Delete all phone numbers associated with the airline
DELETE FROM telefono
WHERE fk_cod_aer = p_id;
-- Then delete the airline itself
DELETE FROM aerolinea
WHERE cod = p_id;
END;
$$ LANGUAGE plpgsql;

DROP PROCEDURE IF EXISTS delete_airline(TEXT) CASCADE;
CREATE OR REPLACE PROCEDURE delete_airline(p_id TEXT) AS $$
BEGIN
    -- Cast to integer and call the main procedure
    CALL delete_airline(p_id::INTEGER);
END;
$$ LANGUAGE plpgsql;
DROP PROCEDURE IF EXISTS upsert_contact_number(INTEGER, INTEGER, VARCHAR, VARCHAR, VARCHAR) CASCADE;
CREATE OR REPLACE PROCEDURE upsert_contact_number(
        p_id INTEGER,
        p_airline_id INTEGER,
        p_cod_area VARCHAR,
        p_numero VARCHAR,
        p_tipo VARCHAR
    ) AS $$ BEGIN IF p_id IS NULL THEN
INSERT INTO telefono (cod_area_tel, numero_tel, tipo_tel, fk_cod_aer)
VALUES (p_cod_area, p_numero, p_tipo, p_airline_id);
ELSE
UPDATE telefono
SET cod_area_tel = p_cod_area,
    numero_tel = p_numero,
    tipo_tel = p_tipo,
    fk_cod_aer = p_airline_id
WHERE cod = p_id;
END IF;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- Reports (basic implementations)
-- =============================================
DROP FUNCTION IF EXISTS get_negative_reviews(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_negative_reviews(p_start DATE, p_end DATE) RETURNS TABLE (
        p_id INTEGER,
        p_date DATE,
        p_hotel_name VARCHAR,
        p_rating INTEGER,
        p_comment TEXT
    ) AS $$ BEGIN RETURN QUERY
SELECT r.cod,
    CURRENT_DATE::DATE,
    COALESCE(h.nombre_hot, 'Unknown'),
    r.rating_res,
    r.descripcion_res
FROM reseña r
    LEFT JOIN hotel h ON r.fk_cod_hotel = h.cod
WHERE r.rating_res <= 2
    AND (
        p_start IS NULL
        OR CURRENT_DATE >= p_start
    )
    AND (
        p_end IS NULL
        OR CURRENT_DATE <= p_end
    )
ORDER BY r.cod DESC;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS get_exchange_rates_history(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_exchange_rates_history(p_start DATE, p_end DATE) RETURNS TABLE (
        p_fecha TIMESTAMP,
        p_moneda VARCHAR,
        p_tasa_bs DECIMAL
    ) AS $$ BEGIN RETURN QUERY
SELECT fecha_hora_tas,
    moneda,
    tasa_bs
FROM tasa_cambio
WHERE (
        p_start IS NULL
        OR fecha_hora_tas::date >= p_start
    )
    AND (
        p_end IS NULL
        OR fecha_hora_tas::date <= p_end
    )
ORDER BY fecha_hora_tas;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS get_operator_performance(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_operator_performance(p_start DATE, p_end DATE) RETURNS TABLE (
        p_rank INTEGER,
        p_operator VARCHAR,
        p_revenue DECIMAL,
        p_service_cost DECIMAL,
        p_duration TEXT
    ) AS $$ BEGIN RETURN QUERY
SELECT ROW_NUMBER() OVER (
        ORDER BY COALESCE(SUM(pay.monto_pago), 0) DESC
    ) AS p_rank,
    COALESCE(pt.nombre_paq, 'Unknown') AS p_operator,
    COALESCE(SUM(pay.monto_pago), 0) AS p_revenue,
    0::DECIMAL AS p_service_cost,
    'N/A'::TEXT
FROM paquete_turistico pt
    LEFT JOIN pago pay ON pay.fk_cod_paquete = pt.cod
GROUP BY pt.nombre_paq
ORDER BY p_revenue DESC;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS get_refunds_audit(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_refunds_audit(p_start DATE, p_end DATE) RETURNS TABLE (
        p_reservation_id VARCHAR,
        p_total_amount DECIMAL,
        p_penalty DECIMAL,
        p_refund_amount DECIMAL,
        p_process_date DATE
    ) AS $$ BEGIN -- No refund table available; return empty set for now
    RETURN QUERY
SELECT ''::VARCHAR,
    0::DECIMAL,
    0::DECIMAL,
    0::DECIMAL,
    NULL::DATE
WHERE FALSE;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS get_customer_age_distribution(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_customer_age_distribution(p_start DATE, p_end DATE) RETURNS TABLE (p_range VARCHAR, p_count INTEGER) AS $$ BEGIN -- Age data not stored; return empty
    RETURN QUERY
SELECT ''::VARCHAR,
    0::INTEGER
WHERE FALSE;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS get_customer_average_age(DATE, DATE) CASCADE;
CREATE OR REPLACE FUNCTION get_customer_average_age(p_start DATE, p_end DATE) RETURNS TABLE (p_avg NUMERIC) AS $$ BEGIN RETURN QUERY
SELECT 0::NUMERIC;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- Convenience triggers: create related parents on insert
-- =============================================
-- BEFORE INSERT/UPDATE for aerolinea: ensure lugar exists and set fk
DROP FUNCTION IF EXISTS before_upsert_aerolinea() CASCADE;
CREATE OR REPLACE FUNCTION before_upsert_aerolinea() RETURNS trigger AS $$
DECLARE v_lug INTEGER;
BEGIN IF NEW.fk_cod_lug IS NOT NULL THEN RETURN NEW;
END IF;
IF NEW.origen_aer IS NOT NULL
AND TRIM(NEW.origen_aer) <> '' THEN
SELECT cod_lug INTO v_lug
FROM lugar
WHERE nombre_lug = NEW.origen_aer
LIMIT 1;
IF v_lug IS NULL THEN
INSERT INTO lugar (nombre_lug, tipo_lug)
VALUES (NEW.origen_aer, 'City')
RETURNING cod_lug INTO v_lug;
END IF;
NEW.fk_cod_lug := v_lug;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_before_upsert_aerolinea ON aerolinea;
CREATE TRIGGER trg_before_upsert_aerolinea BEFORE
INSERT
    OR
UPDATE ON aerolinea FOR EACH ROW EXECUTE FUNCTION before_upsert_aerolinea();
-- BEFORE INSERT for paquete_turistico: ensure default plan, tasa_cambio, and user exist
DROP FUNCTION IF EXISTS before_insert_paquete_turistico() CASCADE;
CREATE OR REPLACE FUNCTION before_insert_paquete_turistico() RETURNS trigger AS $$
DECLARE v_plan INTEGER;
v_tasa INTEGER;
v_user INTEGER;
BEGIN IF NEW.fk_cod_plan_pago IS NULL THEN
SELECT cod INTO v_plan
FROM plan_pago
WHERE nombre_pla = 'Default'
LIMIT 1;
IF v_plan IS NULL THEN
INSERT INTO plan_pago (nombre_pla, porcen_inicial, frecuencia_pago)
VALUES ('Default', 0, 'One-time')
RETURNING cod INTO v_plan;
END IF;
NEW.fk_cod_plan_pago := v_plan;
END IF;
IF NEW.fk_cod_tasa_cambio IS NULL THEN
SELECT cod INTO v_tasa
FROM tasa_cambio
ORDER BY fecha_hora_tas DESC
LIMIT 1;
IF v_tasa IS NOT NULL THEN NEW.fk_cod_tasa_cambio := v_tasa;
END IF;
END IF;
IF NEW.fk_cod_usuario IS NULL THEN
SELECT cod INTO v_user
FROM usuario
ORDER BY cod
LIMIT 1;
IF v_user IS NOT NULL THEN NEW.fk_cod_usuario := v_user;
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_before_insert_paquete ON paquete_turistico;
CREATE TRIGGER trg_before_insert_paquete BEFORE
INSERT ON paquete_turistico FOR EACH ROW EXECUTE FUNCTION before_insert_paquete_turistico();
-- AFTER INSERT example: create placeholder promotion when first package inserted
DROP FUNCTION IF EXISTS after_insert_paquete_turistico() CASCADE;
CREATE OR REPLACE FUNCTION after_insert_paquete_turistico() RETURNS trigger AS $$
DECLARE v_prom INTEGER;
BEGIN IF (
    SELECT COUNT(*)
    FROM promocion
) = 0 THEN
INSERT INTO promocion (tipo_pro, porcen_descuento)
VALUES ('Launch', 0)
RETURNING cod INTO v_prom;
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_after_insert_paquete ON paquete_turistico;
CREATE TRIGGER trg_after_insert_paquete
AFTER
INSERT ON paquete_turistico FOR EACH ROW EXECUTE FUNCTION after_insert_paquete_turistico();
-- =============================================
-- Service Management Procedures
-- =============================================
-- Function to get all transport services (now includes type discrimination)
DROP FUNCTION IF EXISTS get_all_services() CASCADE;
CREATE OR REPLACE FUNCTION get_all_services() RETURNS TABLE (
        p_cod INTEGER,
        p_nombre VARCHAR,
        p_capacidad INTEGER,
        p_numero VARCHAR,
        p_tipo VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT DISTINCT s.cod,
    s.nombre_ser,
    s.capacidad_ser,
    s.numero_ser,
    CASE
        WHEN sa.fk_aerolinea IS NOT NULL THEN 'Flight'::VARCHAR
        WHEN sc.fk_crucero IS NOT NULL THEN 'Cruise'::VARCHAR
        WHEN st.fk_turistico IS NOT NULL THEN 'Tour'::VARCHAR
        WHEN sv.fk_vehiculo IS NOT NULL THEN 'Transport'::VARCHAR
        ELSE 'Service'::VARCHAR
    END
FROM servicio s
    LEFT JOIN ser_aer sa ON s.cod = sa.fk_servicio
    LEFT JOIN ser_cru sc ON s.cod = sc.fk_servicio
    LEFT JOIN tur_ser st ON s.cod = st.fk_servicio
    LEFT JOIN ser_veh sv ON s.cod = sv.fk_servicio
ORDER BY s.nombre_ser;
END;
$$ LANGUAGE plpgsql;
-- Function to get all hotels
DROP FUNCTION IF EXISTS get_all_hotels() CASCADE;
CREATE OR REPLACE FUNCTION get_all_hotels() RETURNS TABLE (
        p_cod INTEGER,
        p_nombre VARCHAR,
        p_direccion VARCHAR,
        p_tipo VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT cod,
    nombre_hot,
    direccion_hot,
    tipo_hot
FROM hotel
ORDER BY nombre_hot;
END;
$$ LANGUAGE plpgsql;
-- Function to get all restaurants
DROP FUNCTION IF EXISTS get_all_restaurants() CASCADE;
CREATE OR REPLACE FUNCTION get_all_restaurants() RETURNS TABLE (
        p_cod INTEGER,
        p_nombre VARCHAR,
        p_tipo VARCHAR,
        p_ambiente VARCHAR,
        p_calificacion INTEGER
    ) AS $$ BEGIN RETURN QUERY
SELECT cod,
    nombre_res,
    tipo_res,
    ambiente_res,
    calificacion_res
FROM restaurant
ORDER BY nombre_res;
END;
$$ LANGUAGE plpgsql;
-- Procedure to add detailed item to package
DROP PROCEDURE IF EXISTS add_item_to_package(INTEGER, INTEGER, VARCHAR, DATE, DATE) CASCADE;
CREATE OR REPLACE PROCEDURE add_item_to_package(
        p_pkg_id INTEGER,
        p_item_id INTEGER,
        p_type VARCHAR,
        p_start_date DATE,
        p_end_date DATE
    ) AS $$
DECLARE v_cost DECIMAL(10, 2);
v_millaje INTEGER;
v_exists BOOLEAN;
BEGIN -- Basic validation
IF p_start_date > p_end_date THEN RAISE EXCEPTION 'Start date cannot be after end date';
END IF;
IF p_type IN (
    'flight',
    'transport',
    'cruise',
    'tour',
    'service'
) THEN -- Check duplicate
SELECT EXISTS(
        SELECT 1
        FROM ser_paq
        WHERE fk_servicio = p_item_id
            AND fk_paquete = p_pkg_id
    ) INTO v_exists;
IF v_exists THEN RAISE EXCEPTION 'Service already added to this package';
END IF;
-- Default Logic for Cost/Mileage (Business Logic)
v_cost := 100 + floor(random() * 400);
v_millaje := 100;
-- Check for active promotion and apply discount
DECLARE v_discount DECIMAL;
BEGIN
SELECT p.porcen_descuento INTO v_discount
FROM promocion p
    JOIN pro_ser ps ON p.cod = ps.fk_promocion
WHERE ps.fk_servicio = p_item_id
    AND p_start_date >= ps.fecha_inicio
    AND p_start_date <= ps.fecha_fin
LIMIT 1;
IF v_discount IS NOT NULL THEN v_cost := v_cost * (1 - (v_discount / 100));
END IF;
END;
-- Flat mileage reward
INSERT INTO ser_paq (
        fk_servicio,
        fk_paquete,
        costo_ser,
        inicio_ser,
        fin_ser,
        millaje_ser
    )
VALUES (
        p_item_id,
        p_pkg_id,
        v_cost,
        p_start_date,
        p_end_date,
        v_millaje
    );
ELSIF p_type = 'hotel' THEN -- Check duplicate
SELECT EXISTS(
        SELECT 1
        FROM hot_paq
        WHERE fk_hotel = p_item_id
            AND fk_paquete = p_pkg_id
    ) INTO v_exists;
IF v_exists THEN RAISE EXCEPTION 'Hotel already added to this package';
END IF;
-- Business Logic for Hotel
v_cost := 300 + floor(random() * 200);
v_millaje := 200;
INSERT INTO hot_paq (
        fk_hotel,
        fk_paquete,
        numero_habitacion_hot,
        inicio_estadia_hot,
        fin_estadia_hot,
        millaje_hot,
        costo_reserva_hot
    )
VALUES (
        p_item_id,
        p_pkg_id,
        'STD-' || floor(random() * 100),
        p_start_date,
        p_end_date,
        v_millaje,
        v_cost
    );
ELSIF p_type = 'restaurant' THEN -- Check duplicate
SELECT EXISTS(
        SELECT 1
        FROM res_paq
        WHERE fk_restaurant = p_item_id
            AND fk_paquete = p_pkg_id
    ) INTO v_exists;
IF v_exists THEN RAISE EXCEPTION 'Restaurant already added to this package';
END IF;
-- Business Logic for Restaurant
v_cost := 50 + floor(random() * 100);
v_millaje := 50;
INSERT INTO res_paq (
        fk_restaurant,
        fk_paquete,
        numero_reservacion_res,
        inicio_reserva_res,
        fin_reserva_res,
        millaje_res,
        costo_reserva_res
    )
VALUES (
        p_item_id,
        p_pkg_id,
        'RES-' || floor(random() * 1000),
        p_start_date,
        p_end_date,
        v_millaje,
        v_cost
    );
ELSE RAISE EXCEPTION 'Invalid item type: %',
p_type;
END IF;
END;
$$ LANGUAGE plpgsql;
-- Procedure to remove item from package
DROP PROCEDURE IF EXISTS remove_item_from_package(INTEGER, INTEGER, VARCHAR) CASCADE;
CREATE OR REPLACE PROCEDURE remove_item_from_package(
        p_pkg_id INTEGER,
        p_item_id INTEGER,
        p_type VARCHAR
    ) AS $$ BEGIN IF p_type = 'flight'
    OR p_type = 'transport' THEN
DELETE FROM ser_paq
WHERE fk_servicio = p_item_id
    AND fk_paquete = p_pkg_id;
ELSIF p_type = 'hotel' THEN
DELETE FROM hot_paq
WHERE fk_hotel = p_item_id
    AND fk_paquete = p_pkg_id;
ELSIF p_type = 'restaurant' THEN
DELETE FROM res_paq
WHERE fk_restaurant = p_item_id
    AND fk_paquete = p_pkg_id;
ELSE RAISE EXCEPTION 'Invalid item type: %',
p_type;
END IF;
END;
$$ LANGUAGE plpgsql;
-- Procedure to add a child package (itinerary composition)
DROP PROCEDURE IF EXISTS add_child_package(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE add_child_package(
        p_parent_id INTEGER,
        p_child_id INTEGER
    ) AS $$
DECLARE v_exists BOOLEAN;
BEGIN -- Prevent circular reference (self-loop only check for now)
IF p_parent_id = p_child_id THEN RAISE EXCEPTION 'Cannot add a package as a child of itself';
END IF;
-- Check if relationship already exists
SELECT EXISTS(
        SELECT 1
        FROM paq_paq
        WHERE fk_paquete_padre = p_parent_id
            AND fk_paquete_hijo = p_child_id
    ) INTO v_exists;
IF v_exists THEN RAISE EXCEPTION 'This package is already included in the itinerary';
END IF;
INSERT INTO paq_paq (fk_paquete_padre, fk_paquete_hijo)
VALUES (p_parent_id, p_child_id);
END;
$$ LANGUAGE plpgsql;
-- Procedure to remove child package
DROP PROCEDURE IF EXISTS remove_child_package(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE remove_child_package(
        p_parent_id INTEGER,
        p_child_id INTEGER
    ) AS $$ BEGIN
DELETE FROM paq_paq
WHERE fk_paquete_padre = p_parent_id
    AND fk_paquete_hijo = p_child_id;
END;
$$ LANGUAGE plpgsql;
-- Auditing helper + table triggers
-- =============================================
-- Helper: record an audit event; uses session setting 'app.current_user' when available
DROP FUNCTION IF EXISTS record_audit(TEXT) CASCADE;
CREATE OR REPLACE FUNCTION record_audit(p_desc TEXT) RETURNS VOID AS $$
DECLARE v_user_text TEXT;
v_user INTEGER;
v_aud INTEGER;
BEGIN -- read current user id from session setting (set by application)
v_user_text := current_setting('app.current_user', true);
IF v_user_text IS NOT NULL
AND trim(v_user_text) <> '' THEN BEGIN v_user := v_user_text::INTEGER;
EXCEPTION
WHEN others THEN v_user := NULL;
END;
ELSE v_user := NULL;
END IF;
SELECT cod INTO v_aud
FROM auditoria
WHERE descripcion = p_desc
LIMIT 1;
IF v_aud IS NULL THEN
INSERT INTO auditoria (descripcion)
VALUES (p_desc)
RETURNING cod INTO v_aud;
END IF;
INSERT INTO aud_usu (fk_usuario, fk_auditoria)
VALUES (v_user, v_aud);
END;
$$ LANGUAGE plpgsql;
-- Triggers for key tables
-- Aerolinea
-- Wrapper functions for audit triggers
DROP FUNCTION IF EXISTS audit_fn_aerolinea_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_aerolinea_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de aerolÃ­nea');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_aerolinea_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_aerolinea_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de aerolÃ­nea');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_aerolinea_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_aerolinea_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de aerolÃ­nea');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_aerolinea_insert ON aerolinea;
CREATE TRIGGER trg_aerolinea_insert
AFTER
INSERT ON aerolinea FOR EACH ROW EXECUTE FUNCTION audit_fn_aerolinea_insert();
DROP TRIGGER IF EXISTS trg_aerolinea_update ON aerolinea;
CREATE TRIGGER trg_aerolinea_update
AFTER
UPDATE ON aerolinea FOR EACH ROW EXECUTE FUNCTION audit_fn_aerolinea_update();
DROP TRIGGER IF EXISTS trg_aerolinea_delete ON aerolinea;
CREATE TRIGGER trg_aerolinea_delete
AFTER DELETE ON aerolinea FOR EACH ROW EXECUTE FUNCTION audit_fn_aerolinea_delete();
-- Paquete turistico
DROP FUNCTION IF EXISTS audit_fn_paquete_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_paquete_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de paquete turÃ­stico');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_paquete_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_paquete_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de paquete turÃ­stico');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_paquete_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_paquete_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de paquete turÃ­stico');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_paquete_insert ON paquete_turistico;
CREATE TRIGGER trg_paquete_insert
AFTER
INSERT ON paquete_turistico FOR EACH ROW EXECUTE FUNCTION audit_fn_paquete_insert();
DROP TRIGGER IF EXISTS trg_paquete_update ON paquete_turistico;
CREATE TRIGGER trg_paquete_update
AFTER
UPDATE ON paquete_turistico FOR EACH ROW EXECUTE FUNCTION audit_fn_paquete_update();
DROP TRIGGER IF EXISTS trg_paquete_delete ON paquete_turistico;
CREATE TRIGGER trg_paquete_delete
AFTER DELETE ON paquete_turistico FOR EACH ROW EXECUTE FUNCTION audit_fn_paquete_delete();
-- Promocion
DROP FUNCTION IF EXISTS audit_fn_promocion_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_promocion_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de promociÃ³n');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_promocion_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_promocion_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de promociÃ³n');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_promocion_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_promocion_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de promociÃ³n');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_promocion_insert ON promocion;
CREATE TRIGGER trg_promocion_insert
AFTER
INSERT ON promocion FOR EACH ROW EXECUTE FUNCTION audit_fn_promocion_insert();
DROP TRIGGER IF EXISTS trg_promocion_update ON promocion;
CREATE TRIGGER trg_promocion_update
AFTER
UPDATE ON promocion FOR EACH ROW EXECUTE FUNCTION audit_fn_promocion_update();
DROP TRIGGER IF EXISTS trg_promocion_delete ON promocion;
CREATE TRIGGER trg_promocion_delete
AFTER DELETE ON promocion FOR EACH ROW EXECUTE FUNCTION audit_fn_promocion_delete();
-- Servicio
DROP FUNCTION IF EXISTS audit_fn_servicio_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_servicio_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de servicio');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_servicio_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_servicio_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de servicio');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_servicio_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_servicio_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de servicio');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_servicio_insert ON servicio;
CREATE TRIGGER trg_servicio_insert
AFTER
INSERT ON servicio FOR EACH ROW EXECUTE FUNCTION audit_fn_servicio_insert();
DROP TRIGGER IF EXISTS trg_servicio_update ON servicio;
CREATE TRIGGER trg_servicio_update
AFTER
UPDATE ON servicio FOR EACH ROW EXECUTE FUNCTION audit_fn_servicio_update();
DROP TRIGGER IF EXISTS trg_servicio_delete ON servicio;
CREATE TRIGGER trg_servicio_delete
AFTER DELETE ON servicio FOR EACH ROW EXECUTE FUNCTION audit_fn_servicio_delete();
-- Hotel
DROP FUNCTION IF EXISTS audit_fn_hotel_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_hotel_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de hotel');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_hotel_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_hotel_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de hotel');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_hotel_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_hotel_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de hotel');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_hotel_insert ON hotel;
CREATE TRIGGER trg_hotel_insert
AFTER
INSERT ON hotel FOR EACH ROW EXECUTE FUNCTION audit_fn_hotel_insert();
DROP TRIGGER IF EXISTS trg_hotel_update ON hotel;
CREATE TRIGGER trg_hotel_update
AFTER
UPDATE ON hotel FOR EACH ROW EXECUTE FUNCTION audit_fn_hotel_update();
DROP TRIGGER IF EXISTS trg_hotel_delete ON hotel;
CREATE TRIGGER trg_hotel_delete
AFTER DELETE ON hotel FOR EACH ROW EXECUTE FUNCTION audit_fn_hotel_delete();
-- Restaurant
DROP FUNCTION IF EXISTS audit_fn_restaurant_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_restaurant_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de restaurante');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_restaurant_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_restaurant_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de restaurante');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_restaurant_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_restaurant_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de restaurante');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_restaurant_insert ON restaurant;
CREATE TRIGGER trg_restaurant_insert
AFTER
INSERT ON restaurant FOR EACH ROW EXECUTE FUNCTION audit_fn_restaurant_insert();
DROP TRIGGER IF EXISTS trg_restaurant_update ON restaurant;
CREATE TRIGGER trg_restaurant_update
AFTER
UPDATE ON restaurant FOR EACH ROW EXECUTE FUNCTION audit_fn_restaurant_update();
DROP TRIGGER IF EXISTS trg_restaurant_delete ON restaurant;
CREATE TRIGGER trg_restaurant_delete
AFTER DELETE ON restaurant FOR EACH ROW EXECUTE FUNCTION audit_fn_restaurant_delete();
-- Pago
DROP FUNCTION IF EXISTS audit_fn_pago_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_pago_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de pago');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_pago_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_pago_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de pago');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_pago_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_pago_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de pago');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_pago_insert ON pago;
CREATE TRIGGER trg_pago_insert
AFTER
INSERT ON pago FOR EACH ROW EXECUTE FUNCTION audit_fn_pago_insert();
DROP TRIGGER IF EXISTS trg_pago_update ON pago;
CREATE TRIGGER trg_pago_update
AFTER
UPDATE ON pago FOR EACH ROW EXECUTE FUNCTION audit_fn_pago_update();
DROP TRIGGER IF EXISTS trg_pago_delete ON pago;
CREATE TRIGGER trg_pago_delete
AFTER DELETE ON pago FOR EACH ROW EXECUTE FUNCTION audit_fn_pago_delete();
-- MetodoDePago
DROP FUNCTION IF EXISTS audit_fn_metodopago_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_metodopago_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de mÃ©todo de pago');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_metodopago_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_metodopago_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de mÃ©todo de pago');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_metodopago_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_metodopago_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de mÃ©todo de pago');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_metodopago_insert ON metodoDePago;
CREATE TRIGGER trg_metodopago_insert
AFTER
INSERT ON metodoDePago FOR EACH ROW EXECUTE FUNCTION audit_fn_metodopago_insert();
DROP TRIGGER IF EXISTS trg_metodopago_update ON metodoDePago;
CREATE TRIGGER trg_metodopago_update
AFTER
UPDATE ON metodoDePago FOR EACH ROW EXECUTE FUNCTION audit_fn_metodopago_update();
DROP TRIGGER IF EXISTS trg_metodopago_delete ON metodoDePago;
CREATE TRIGGER trg_metodopago_delete
AFTER DELETE ON metodoDePago FOR EACH ROW EXECUTE FUNCTION audit_fn_metodopago_delete();
-- Telefono (contact)
DROP FUNCTION IF EXISTS audit_fn_telefono_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_telefono_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de contacto');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_telefono_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_telefono_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de contacto');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_telefono_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_telefono_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de contacto');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_telefono_insert ON telefono;
CREATE TRIGGER trg_telefono_insert
AFTER
INSERT ON telefono FOR EACH ROW EXECUTE FUNCTION audit_fn_telefono_insert();
DROP TRIGGER IF EXISTS trg_telefono_update ON telefono;
CREATE TRIGGER trg_telefono_update
AFTER
UPDATE ON telefono FOR EACH ROW EXECUTE FUNCTION audit_fn_telefono_update();
DROP TRIGGER IF EXISTS trg_telefono_delete ON telefono;
CREATE TRIGGER trg_telefono_delete
AFTER DELETE ON telefono FOR EACH ROW EXECUTE FUNCTION audit_fn_telefono_delete();
-- Reclamo
DROP FUNCTION IF EXISTS audit_fn_reclamo_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_reclamo_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de reclamo');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_reclamo_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_reclamo_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de reclamo');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_reclamo_resolve() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_reclamo_resolve() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ResoluciÃ³n de reclamo');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_reclamo_insert ON reclamo;
CREATE TRIGGER trg_reclamo_insert
AFTER
INSERT ON reclamo FOR EACH ROW EXECUTE FUNCTION audit_fn_reclamo_insert();
DROP TRIGGER IF EXISTS trg_reclamo_update ON reclamo;
CREATE TRIGGER trg_reclamo_update
AFTER
UPDATE ON reclamo FOR EACH ROW EXECUTE FUNCTION audit_fn_reclamo_update();
DROP TRIGGER IF EXISTS trg_reclamo_resolve ON reclamo;
CREATE TRIGGER trg_reclamo_resolve
AFTER
UPDATE ON reclamo FOR EACH ROW
    WHEN (NEW.estado_rec = 'Cerrado') EXECUTE FUNCTION audit_fn_reclamo_resolve();
-- ReseÃ±a
DROP FUNCTION IF EXISTS audit_fn_resena_insert() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_resena_insert() RETURNS trigger AS $$ BEGIN PERFORM record_audit('CreaciÃ³n de reseÃ±a');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_resena_update() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_resena_update() RETURNS trigger AS $$ BEGIN PERFORM record_audit('ActualizaciÃ³n de reseÃ±a');
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP FUNCTION IF EXISTS audit_fn_resena_delete() CASCADE;
CREATE OR REPLACE FUNCTION audit_fn_resena_delete() RETURNS trigger AS $$ BEGIN PERFORM record_audit('EliminaciÃ³n de reseÃ±a');
RETURN OLD;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_resena_insert ON reseña;
CREATE TRIGGER trg_resena_insert
AFTER
INSERT ON reseña FOR EACH ROW EXECUTE FUNCTION audit_fn_resena_insert();
DROP TRIGGER IF EXISTS trg_resena_update ON reseña;
CREATE TRIGGER trg_resena_update
AFTER
UPDATE ON reseña FOR EACH ROW EXECUTE FUNCTION audit_fn_resena_update();
DROP TRIGGER IF EXISTS trg_resena_delete ON reseña;
CREATE TRIGGER trg_resena_delete
AFTER DELETE ON reseña FOR EACH ROW EXECUTE FUNCTION audit_fn_resena_delete();
-- =============================================
-- 10. DASHBOARD & REPORTING FUNCTIONS
-- =============================================
-- Dashboard Stats
DROP FUNCTION IF EXISTS get_dashboard_stats();
CREATE OR REPLACE FUNCTION get_dashboard_stats() RETURNS TABLE (
        total_sales DECIMAL,
        active_users BIGINT,
        total_packages BIGINT,
        monthly_revenue DECIMAL
    ) AS $$ BEGIN RETURN QUERY
SELECT COALESCE(
        (
            SELECT SUM(monto_pago)
            FROM pago
        ),
        0
    )::DECIMAL as total_sales,
    (
        SELECT COUNT(*)
        FROM usuario
    )::BIGINT as active_users,
    (
        SELECT COUNT(*)
        FROM paquete_turistico
    )::BIGINT as total_packages,
    COALESCE(
        (
            SELECT SUM(monto_pago)
            FROM pago
            WHERE EXTRACT(
                    MONTH
                    FROM fecha_pago
                ) = EXTRACT(
                    MONTH
                    FROM CURRENT_DATE
                )
                AND EXTRACT(
                    YEAR
                    FROM fecha_pago
                ) = EXTRACT(
                    YEAR
                    FROM CURRENT_DATE
                )
        ),
        0
    )::DECIMAL as monthly_revenue;
END;
$$ LANGUAGE plpgsql;
-- Report 1: Negative Reviews (<= 2 stars) for Hotels
DROP FUNCTION IF EXISTS get_negative_reviews(DATE, DATE);
CREATE OR REPLACE FUNCTION get_negative_reviews(
        p_start DATE DEFAULT NULL,
        p_end DATE DEFAULT NULL
    ) RETURNS TABLE (
        id INTEGER,
        "hotelName" VARCHAR,
        "date" TEXT,
        "comment" TEXT,
        rating INTEGER
    ) AS $$ BEGIN RETURN QUERY
SELECT DISTINCT ON (r.cod) r.cod::INTEGER,
    h.nombre_hot::VARCHAR,
    COALESCE(TO_CHAR(hp.inicio_estadia_hot, 'YYYY-MM-DD'), '')::TEXT,
    r.descripcion_res::TEXT,
    r.rating_res::INTEGER
FROM reseña r
    JOIN hotel h ON r.fk_cod_hotel = h.cod
    LEFT JOIN hot_paq hp ON r.fk_cod_hotel = hp.fk_hotel
WHERE r.rating_res <= 2
    AND (
        p_start IS NULL
        OR hp.inicio_estadia_hot >= p_start
    )
    AND (
        p_end IS NULL
        OR hp.inicio_estadia_hot <= p_end
    )
ORDER BY r.cod,
    hp.inicio_estadia_hot DESC
LIMIT 100;
END;
$$ LANGUAGE plpgsql;
-- Report 2: Historical Exchange Rates
DROP FUNCTION IF EXISTS get_exchange_rates_history(DATE, DATE);
CREATE OR REPLACE FUNCTION get_exchange_rates_history(
        p_start DATE DEFAULT NULL,
        p_end DATE DEFAULT NULL
    ) RETURNS TABLE (
        p_fecha TIMESTAMP,
        p_moneda VARCHAR,
        p_tasa_bs DECIMAL
    ) AS $$ BEGIN RETURN QUERY
SELECT fecha_hora_tas,
    moneda,
    tasa_bs
FROM tasa_cambio
WHERE (
        p_start IS NULL
        OR fecha_hora_tas >= p_start
    )
    AND (
        p_end IS NULL
        OR fecha_hora_tas <= p_end
    )
ORDER BY fecha_hora_tas ASC;
END;
$$ LANGUAGE plpgsql;
-- Report 3: Operator Performance (Tours = Turistico, Car Rental = Vehiculo/Terrestre)
DROP FUNCTION IF EXISTS get_operator_performance(DATE, DATE);
CREATE OR REPLACE FUNCTION get_operator_performance(
        p_start DATE DEFAULT NULL,
        p_end DATE DEFAULT NULL
    ) RETURNS TABLE (
        "rank" BIGINT,
        "operator" VARCHAR,
        revenue DECIMAL,
        "serviceCost" DECIMAL,
        duration VARCHAR
    ) AS $$ BEGIN RETURN QUERY WITH operator_revenue AS (
        -- Tours
        SELECT t.nombre AS op_name,
            COALESCE(SUM(ts.costo_ser), 0) AS total_rev,
            COALESCE(SUM(ts.costo_ser * 0.7), 0) AS cost_est,
            -- Mock cost calculation
            'Tour' AS type
        FROM turistico t
            JOIN tur_ser tus ON t.cod = tus.fk_turistico
            JOIN ser_paq ts ON tus.fk_servicio = ts.fk_servicio
        WHERE (
                p_start IS NULL
                OR ts.inicio_ser >= p_start
            )
            AND (
                p_end IS NULL
                OR ts.inicio_ser <= p_end
            )
        GROUP BY t.nombre
        UNION ALL
        -- Car Rentals (Vehiculo -> Terrestre)
        SELECT te.nombre AS op_name,
            COALESCE(SUM(vs.costo_ser), 0) AS total_rev,
            COALESCE(SUM(vs.costo_ser * 0.6), 0) AS cost_est,
            'Rental' AS type
        FROM terrestre te
            JOIN vehiculo v ON te.cod = v.fk_cod_terrestre
            JOIN ser_veh sv ON v.cod = sv.fk_vehiculo
            JOIN ser_paq vs ON sv.fk_servicio = vs.fk_servicio
        WHERE (
                p_start IS NULL
                OR vs.inicio_ser >= p_start
            )
            AND (
                p_end IS NULL
                OR vs.inicio_ser <= p_end
            )
        GROUP BY te.nombre
    )
SELECT RANK() OVER (
        ORDER BY total_rev DESC
    )::BIGINT,
    op_name::VARCHAR,
    total_rev::DECIMAL,
    cost_est::DECIMAL,
    'N/A'::VARCHAR -- Duration placeholder
FROM operator_revenue
ORDER BY total_rev DESC;
END;
$$ LANGUAGE plpgsql;
-- Report 4: Refunds Audit
DROP FUNCTION IF EXISTS get_refunds_audit(DATE, DATE);
CREATE OR REPLACE FUNCTION get_refunds_audit(
        p_start DATE DEFAULT NULL,
        p_end DATE DEFAULT NULL
    ) RETURNS TABLE (
        "reservationId" INTEGER,
        "totalAmount" DECIMAL,
        penalty DECIMAL,
        "refundAmount" DECIMAL,
        "processDate" TEXT
    ) AS $$ BEGIN RETURN QUERY
SELECT pt.cod,
    -- Calculate total amount from payments (if any) or assume base cost
    COALESCE(
        (
            SELECT SUM(monto_pago)
            FROM pago
            WHERE fk_cod_paquete = pt.cod
        ),
        0
    )::DECIMAL as total,
    (
        COALESCE(
            (
                SELECT SUM(monto_pago)
                FROM pago
                WHERE fk_cod_paquete = pt.cod
            ),
            0
        ) * 0.10
    )::DECIMAL as pen,
    (
        COALESCE(
            (
                SELECT SUM(monto_pago)
                FROM pago
                WHERE fk_cod_paquete = pt.cod
            ),
            0
        ) * 0.90
    )::DECIMAL as ref,
    TO_CHAR(pt.fecha_cancelacion, 'YYYY-MM-DD')
FROM paquete_turistico pt
WHERE pt.estado_paq = 'Cancelled'
    AND pt.fecha_cancelacion IS NOT NULL
    AND (
        p_start IS NULL
        OR pt.fecha_cancelacion >= p_start
    )
    AND (
        p_end IS NULL
        OR pt.fecha_cancelacion <= p_end
    );
END;
$$ LANGUAGE plpgsql;
-- Report 5.1: Age Distribution
DROP FUNCTION IF EXISTS get_customer_age_distribution(DATE, DATE);
CREATE OR REPLACE FUNCTION get_customer_age_distribution(
        p_start DATE DEFAULT NULL,
        p_end DATE DEFAULT NULL
    ) RETURNS TABLE ("range" VARCHAR, "count" BIGINT) AS $$ BEGIN RETURN QUERY
SELECT CASE
        WHEN AGE(fecha_nacimiento) < INTERVAL '25 years' THEN '18-24'
        WHEN AGE(fecha_nacimiento) < INTERVAL '35 years' THEN '25-34'
        WHEN AGE(fecha_nacimiento) < INTERVAL '45 years' THEN '35-44'
        WHEN AGE(fecha_nacimiento) < INTERVAL '55 years' THEN '45-54'
        ELSE '55+'
    END::VARCHAR as age_range,
    COUNT(*)::BIGINT
FROM usuario
WHERE fecha_nacimiento IS NOT NULL -- Note: Time period for "customers booking trips". joining to packages would be better.
    -- For now, simple user stats. logic can be refined to join table package_turistico
GROUP BY age_range
ORDER BY age_range;
END;
$$ LANGUAGE plpgsql;
-- Report 5.2: Average Age
DROP FUNCTION IF EXISTS get_customer_average_age(DATE, DATE);
CREATE OR REPLACE FUNCTION get_customer_average_age(
        p_start DATE DEFAULT NULL,
        p_end DATE DEFAULT NULL
    ) RETURNS TABLE (p_avg DECIMAL) AS $$ BEGIN RETURN QUERY
SELECT AVG(
        EXTRACT(
            YEAR
            FROM AGE(fecha_nacimiento)
        )
    )::DECIMAL
FROM usuario
WHERE fecha_nacimiento IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- PRIVILEGE MANAGEMENT FUNCTIONS AND PROCEDURES
-- =============================================
-- Function: Get all privileges
DROP FUNCTION IF EXISTS get_all_privileges() CASCADE;
CREATE OR REPLACE FUNCTION get_all_privileges() RETURNS TABLE (
        p_cod INTEGER,
        p_descripcion_priv VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT cod,
    descripcion_priv
FROM privilegio
ORDER BY cod;
END;
$$ LANGUAGE plpgsql;
-- Function: Get privileges for a specific role
DROP FUNCTION IF EXISTS get_role_privileges(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_role_privileges(p_role_id INTEGER) RETURNS TABLE (
        p_cod INTEGER,
        p_descripcion_priv VARCHAR
    ) AS $$ BEGIN RETURN QUERY
SELECT p.cod,
    p.descripcion_priv
FROM privilegio p
    INNER JOIN priv_rol pr ON p.cod = pr.fk_cod_privilegio
WHERE pr.fk_cod_rol = p_role_id
ORDER BY p.cod;
END;
$$ LANGUAGE plpgsql;
-- Function: Check if a user has a specific privilege
DROP FUNCTION IF EXISTS user_has_privilege(INTEGER, VARCHAR) CASCADE;
CREATE OR REPLACE FUNCTION user_has_privilege(
        p_user_id INTEGER,
        p_privilege_name VARCHAR
    ) RETURNS BOOLEAN AS $$
DECLARE v_has_privilege BOOLEAN;
BEGIN
SELECT EXISTS (
        SELECT 1
        FROM usuario u
            INNER JOIN priv_rol pr ON u.fk_cod_rol = pr.fk_cod_rol
            INNER JOIN privilegio p ON pr.fk_cod_privilegio = p.cod
        WHERE u.cod = p_user_id
            AND p.descripcion_priv = p_privilege_name
    ) INTO v_has_privilege;
RETURN v_has_privilege;
END;
$$ LANGUAGE plpgsql;
-- Procedure: Assign a privilege to a role
DROP PROCEDURE IF EXISTS assign_privilege_to_role(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE assign_privilege_to_role(
        p_role_id INTEGER,
        p_privilege_id INTEGER
    ) AS $$ BEGIN -- Insert if not exists (avoid duplicates)
    IF NOT EXISTS (
        SELECT 1
        FROM priv_rol
        WHERE fk_cod_rol = p_role_id
            AND fk_cod_privilegio = p_privilege_id
    ) THEN
INSERT INTO priv_rol (fk_cod_rol, fk_cod_privilegio)
VALUES (p_role_id, p_privilege_id);
END IF;
END;
$$ LANGUAGE plpgsql;
-- Procedure: Remove a privilege from a role
DROP PROCEDURE IF EXISTS remove_privilege_from_role(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE remove_privilege_from_role(
        p_role_id INTEGER,
        p_privilege_id INTEGER
    ) AS $$ BEGIN
DELETE FROM priv_rol
WHERE fk_cod_rol = p_role_id
    AND fk_cod_privilegio = p_privilege_id;
END;
$$ LANGUAGE plpgsql;
-- =============================================
-- Promotion Service Assignment Procedures
-- =============================================
DROP PROCEDURE IF EXISTS assign_promotion_to_service(INTEGER, INTEGER, DATE, DATE) CASCADE;
CREATE OR REPLACE PROCEDURE assign_promotion_to_service(
        p_promotion_id INTEGER,
        p_service_id INTEGER,
        p_start_date DATE,
        p_end_date DATE
    ) LANGUAGE plpgsql AS $$ BEGIN -- Check if assignment already exists
    IF EXISTS (
        SELECT 1
        FROM pro_ser
        WHERE fk_promocion = p_promotion_id
            AND fk_servicio = p_service_id
    ) THEN -- Update dates if it exists
UPDATE pro_ser
SET fecha_inicio = p_start_date,
    fecha_fin = p_end_date
WHERE fk_promocion = p_promotion_id
    AND fk_servicio = p_service_id;
ELSE
INSERT INTO pro_ser (
        fk_promocion,
        fk_servicio,
        fecha_inicio,
        fecha_fin
    )
VALUES (
        p_promotion_id,
        p_service_id,
        p_start_date,
        p_end_date
    );
END IF;
END;
$$;
DROP PROCEDURE IF EXISTS remove_promotion_from_service(INTEGER, INTEGER) CASCADE;
CREATE OR REPLACE PROCEDURE remove_promotion_from_service(
        p_promotion_id INTEGER,
        p_service_id INTEGER
    ) LANGUAGE plpgsql AS $$ BEGIN
DELETE FROM pro_ser
WHERE fk_promocion = p_promotion_id
    AND fk_servicio = p_service_id;
END;
$$;
DROP FUNCTION IF EXISTS get_promotion_services(INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION get_promotion_services(p_promotion_id INTEGER) RETURNS TABLE (
        p_cod INTEGER,
        p_nombre VARCHAR,
        p_fecha_inicio DATE,
        p_fecha_fin DATE
    ) LANGUAGE plpgsql AS $$ BEGIN RETURN QUERY
SELECT s.cod,
    s.nombre_ser,
    ps.fecha_inicio,
    ps.fecha_fin
FROM servicio s
    JOIN pro_ser ps ON s.cod = ps.fk_servicio
WHERE ps.fk_promocion = p_promotion_id;
END;
$$;
-- =============================================
-- MERGED PROCEDURES AND FUNCTIONS
-- From update_payment_logic.sql and update_return_id.sql
-- =============================================
-- Procedure to process a payment
-- Removed duplicate process_payment
-- Function to get user bookings
-- Function to create package returning ID
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
/*
 =============================================
 USEFUL QUERIES (Archived)
 =============================================
 -- Check User Bookings:
 SELECT 
 u.cod AS user_id,
 u.primer_nombre_usu || ' ' || u.primer_apellido_usu AS user_name,
 u.email_usu AS user_email,
 p.cod AS package_id,
 p.nombre_paq AS package_name,
 p.estado_paq AS package_status,
 pay.fecha_pago AS payment_date,
 pay.monto_pago AS amount_paid
 FROM 
 usuario u
 JOIN 
 paquete_turistico p ON u.cod = p.fk_cod_usuario
 LEFT JOIN 
 pago pay ON p.cod = pay.fk_cod_paquete
 ORDER BY 
 u.cod DESC, p.cod DESC;
 
 -- Query Hierarchy:
 SELECT p_parent.nombre_paq AS paquete_padre, p_child.nombre_paq AS paquete_hijo 
 FROM paq_paq pp 
 JOIN paquete_turistico p_parent ON pp.fk_paquete_padre = p_parent.cod 
 JOIN paquete_turistico p_child ON pp.fk_paquete_hijo = p_child.cod;
 */
-- =============================================
-- PAYMENT & PASSENGER PROCEDURES (ADDED FOR PHASE 4)
-- =============================================
-- 1. Add Passenger to Booking (Updates/Inserts ser_paq)
CREATE OR REPLACE PROCEDURE add_passenger_to_booking(
        p_booking_id INTEGER,
        p_first_name VARCHAR,
        p_last_name VARCHAR,
        p_passport VARCHAR,
        p_dob DATE
    ) AS $$
DECLARE v_service RECORD;
v_available_row INTEGER;
BEGIN -- Loop through each unique service type currently in the package
FOR v_service IN
SELECT DISTINCT fk_servicio,
    costo_ser,
    inicio_ser,
    fin_ser,
    millaje_ser
FROM ser_paq
WHERE fk_paquete = p_booking_id LOOP -- Check if there's an 'empty' slot (row with NULL passenger) for this service
SELECT cod INTO v_available_row
FROM ser_paq
WHERE fk_paquete = p_booking_id
    AND fk_servicio = v_service.fk_servicio
    AND nombre_pasajero IS NULL
LIMIT 1;
IF v_available_row IS NOT NULL THEN -- Slot found, update it
UPDATE ser_paq
SET nombre_pasajero = p_first_name,
    apellido_pasajero = p_last_name,
    n_pasaporte_pasajero = p_passport,
    fecha_nacimiento_pasajero = p_dob
WHERE cod = v_available_row;
ELSE -- No slot found (must be 2nd+ passenger), create new row
INSERT INTO ser_paq (
        fk_servicio,
        fk_paquete,
        costo_ser,
        inicio_ser,
        fin_ser,
        millaje_ser,
        nombre_pasajero,
        apellido_pasajero,
        n_pasaporte_pasajero,
        fecha_nacimiento_pasajero
    )
VALUES (
        v_service.fk_servicio,
        p_booking_id,
        v_service.costo_ser,
        v_service.inicio_ser,
        v_service.fin_ser,
        v_service.millaje_ser,
        p_first_name,
        p_last_name,
        p_passport,
        p_dob
    );
END IF;
END LOOP;
END;
$$ LANGUAGE plpgsql;
-- 2. Process Payment
CREATE OR REPLACE PROCEDURE process_payment(
        p_user_id INTEGER,
        p_package_id INTEGER,
        p_amount DECIMAL,
        p_method_type VARCHAR,
        p_description VARCHAR,
        -- Payment Details
        p_card_number VARCHAR,
        p_card_holder VARCHAR,
        p_expiry DATE,
        p_cvv VARCHAR,
        p_card_type VARCHAR,
        p_card_bank VARCHAR,
        p_check_number VARCHAR,
        p_check_holder VARCHAR,
        p_check_bank VARCHAR,
        p_check_issue_date DATE,
        p_check_account VARCHAR,
        p_dep_number VARCHAR,
        p_dep_bank VARCHAR,
        p_dep_date DATE,
        p_dep_ref VARCHAR,
        p_transfer_number VARCHAR,
        p_transfer_time TIMESTAMP,
        p_pm_ref VARCHAR,
        p_pm_time TIMESTAMP,
        p_usdt_wallet VARCHAR,
        p_usdt_date DATE,
        p_usdt_time TIMESTAMP,
        p_zelle_conf VARCHAR,
        p_zelle_date DATE,
        p_zelle_time TIMESTAMP,
        p_miles INTEGER,
        -- Generic Fallbacks
        p_zelle_email VARCHAR,
        p_zelle_phone VARCHAR,
        p_cedula VARCHAR,
        p_phone VARCHAR
    ) AS $$
DECLARE v_method_id INTEGER;
BEGIN -- 1. Create Payment Method Record
INSERT INTO metodoDePago (
        descripcion_met,
        fk_usuario,
        tipoMetodo,
        -- Mappings based on type
        n_tarjeta_tar,
        titular_tar,
        f_venc_tar,
        cod_seg_tar,
        tipo_tar,
        banco_tar,
        -- Card
        n_cheque_che,
        titular_che,
        bancoemisor_che,
        f_emision_che,
        cod_cuenta_che,
        -- Check
        n_ref_dep,
        banco_dep,
        fecha_dep,
        n_destino_dep,
        -- Deposit
        n_ref_tra,
        f_hora_tra,
        -- Transfer
        n_ref_pag,
        f_hora_pag,
        -- PagoMovil
        billetera_usd,
        f_hora_usd,
        -- USDt (combine date/time?)
        n_confirm_zel,
        f_hora_zel -- Zelle
    )
VALUES (
        p_description,
        p_user_id,
        p_method_type,
        p_card_number,
        p_card_holder,
        p_expiry,
        p_cvv,
        p_card_type,
        p_card_bank,
        p_check_number,
        p_check_holder,
        p_check_bank,
        p_check_issue_date,
        p_check_account,
        p_dep_number,
        p_dep_bank,
        p_dep_date,
        p_dep_ref,
        p_transfer_number,
        p_transfer_time,
        p_pm_ref,
        p_pm_time,
        p_usdt_wallet,
        p_usdt_time,
        -- Assuming timestamp provided
        p_zelle_conf,
        p_zelle_time
    )
RETURNING cod INTO v_method_id;
-- 2. Create Payment Record
INSERT INTO pago (
        monto_pago,
        fecha_pago,
        fk_cod_paquete,
        fk_metodo_pago
    )
VALUES (p_amount, NOW(), p_package_id, v_method_id);
-- 3. Update Package Status
UPDATE paquete_turistico
SET estado_paq = 'Confirmed'
WHERE cod = p_package_id;
END;
$$ LANGUAGE plpgsql;
-- 3. Get User Bookings: Removed (See updated definition below)
-- UPDATED get_user_bookings for Phase 5 (Composition & Price)
-- FINAL UPDATE get_user_bookings for Phase 5 (Composition & Price & BookingDate)
-- FINAL DEFINITION: get_user_bookings
CREATE OR REPLACE FUNCTION get_user_bookings(p_user_id INTEGER) RETURNS TABLE (
        id INTEGER,
        packageName VARCHAR,
        destination VARCHAR,
        startDate DATE,
        duration INTEGER,
        passengers INTEGER,
        status VARCHAR,
        totalPrice DECIMAL,
        composition VARCHAR,
        bookingDate TIMESTAMP
    ) AS $$ BEGIN RETURN QUERY
SELECT p.cod AS id,
    p.nombre_paq AS packageName,
    'Destino Variable'::VARCHAR AS destination,
    MIN(sp.inicio_ser) AS startDate,
    (MAX(sp.fin_ser) - MIN(sp.inicio_ser)) AS duration,
    COUNT(DISTINCT sp.nombre_pasajero)::INTEGER AS passengers,
    p.estado_paq AS status,
    (
        COALESCE(SUM(sp.costo_ser), 0) + COALESCE(
            (
                SELECT SUM(child_sp.costo_ser)
                FROM paq_paq pp
                    JOIN ser_paq child_sp ON pp.fk_paquete_hijo = child_sp.fk_paquete
                WHERE pp.fk_paquete_padre = p.cod
            ),
            0
        )
    )::DECIMAL AS totalPrice,
    COALESCE(
        (
            SELECT STRING_AGG(
                    p_child.nombre_paq || ' ($' || COALESCE(
                        (
                            SELECT SUM(s_c.costo_ser)
                            FROM ser_paq s_c
                            WHERE s_c.fk_paquete = p_child.cod
                        ),
                        0
                    ) || ')',
                    ', '
                )
            FROM paq_paq pp_c
                JOIN paquete_turistico p_child ON pp_c.fk_paquete_hijo = p_child.cod
            WHERE pp_c.fk_paquete_padre = p.cod
        ),
        'Direct Booking'
    )::VARCHAR AS composition,
    MAX(pa.fecha_pago)::TIMESTAMP AS bookingDate
FROM paquete_turistico p
    LEFT JOIN ser_paq sp ON p.cod = sp.fk_paquete
    LEFT JOIN pago pa ON p.cod = pa.fk_cod_paquete
WHERE p.fk_cod_usuario = p_user_id
GROUP BY p.cod;
END;
$$ LANGUAGE plpgsql;