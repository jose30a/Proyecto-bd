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
    tipo_pro VARCHAR(50) NOT NULL
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

-- Procedure to update user password (using procedure for UPDATE operation)
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