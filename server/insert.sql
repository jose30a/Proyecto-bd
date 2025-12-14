/*
 * SCRIPT FINAL V3 - CORRECCIÓN DE UNICIDAD (NO MORE ERRORS)
 * 1. Elimina random en campos UNIQUE (CI, Pasaporte, Email).
 * 2. Mantiene nombres reales y contraseñas.
 * 3. Reinicia todas las secuencias.
 */


-- =============================================
-- 0. LIMPIEZA TOTAL (Evita conflictos de IDs viejos)
-- =============================================
TRUNCATE TABLE 
    aud_usu, auditoria, pago, metodoDePago, pro_ser, pre_usu, tur_ser, paq_paq, tag_usu, tag_paq, 
    tag, preferencia, promocion, reseña, reclamo, deseo, telefono, 
    res_paq, ser_veh, ser_cru, ser_aer, hot_paq, ser_paq, 
    paquete_turistico, plan_pago, tasa_cambio, servicio, 
    vehiculo, barco, aeronave, 
    restaurant, hotel, turistico, terrestre, crucero, aerolinea, terminal, 
    usuario, priv_rol, privilegio, rol, lugar
RESTART IDENTITY CASCADE;

-- =============================================
-- 1. GEOGRAFÍA
-- =============================================
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre) VALUES
('America', 'Continente', NULL), ('Europa', 'Continente', NULL), 
('Asia', 'Continente', NULL), ('Africa', 'Continente', NULL), ('Oceania', 'Continente', NULL);

-- Países
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre) VALUES
('Estados Unidos', 'Pais', 1), ('México', 'Pais', 1), ('Brasil', 'Pais', 1), ('Argentina', 'Pais', 1), ('Canadá', 'Pais', 1),
('España', 'Pais', 2), ('Francia', 'Pais', 2), ('Italia', 'Pais', 2), ('Alemania', 'Pais', 2), ('Reino Unido', 'Pais', 2),
('Japón', 'Pais', 3), ('China', 'Pais', 3), ('India', 'Pais', 3), ('Tailandia', 'Pais', 3), ('Corea del Sur', 'Pais', 3),
('Egipto', 'Pais', 4), ('Sudáfrica', 'Pais', 4), ('Marruecos', 'Pais', 4), ('Kenia', 'Pais', 4), ('Nigeria', 'Pais', 4),
('Australia', 'Pais', 5), ('Nueva Zelanda', 'Pais', 5), ('Fiji', 'Pais', 5), ('Samoa', 'Pais', 5), ('Tonga', 'Pais', 5);

-- Venezuela
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre) VALUES ('Venezuela', 'Pais', 1);

INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre) 
SELECT unnest(ARRAY[
    'Distrito Capital', 'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 
    'Cojedes', 'Delta Amacuro', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 
    'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'La Guaira', 'Yaracuy', 'Zulia'
]), 'Estado', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Venezuela');

-- Ciudades
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre)
SELECT 'Ciudad de ' || nombre_lug, 'Ciudad', cod_lug 
FROM lugar WHERE tipo_lug IN ('Pais', 'Estado') AND nombre_lug != 'Venezuela';

-- Parques
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre) VALUES
('Central Park', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Estados Unidos')),
('Parque Güell', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'España')),
('Monte Fuji', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Japón')),
('Gran Barrera de Coral', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Australia')),
('Serengeti', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Kenia')),
('Canaima', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Bolívar')),
('Morrocoy', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Falcón')),
('El Ávila', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Distrito Capital')),
('Mochima', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Sucre')),
('Sierra Nevada', 'Parque', (SELECT cod_lug FROM lugar WHERE nombre_lug = 'Mérida'));

-- =============================================
-- 2. INFRAESTRUCTURA
-- =============================================
INSERT INTO terminal (nombre_ter, tipo_ter, fk_cod_lug)
SELECT 'Aeropuerto Intl ' || nombre_lug, 'Aeropuerto', cod_lug
FROM lugar WHERE tipo_lug IN ('Pais', 'Estado') AND nombre_lug != 'Venezuela';

INSERT INTO terminal (nombre_ter, tipo_ter, fk_cod_lug)
SELECT 'Puerto de ' || nombre_lug, 'Puerto', cod_lug
FROM lugar
WHERE nombre_lug IN ('España', 'Italia', 'Australia', 'Fiji', 'La Guaira', 'Nueva Esparta', 'Anzoátegui', 'Sucre', 'Falcón', 'Estados Unidos')
LIMIT 10;

-- =============================================
-- 3. PROVEEDORES
-- =============================================
INSERT INTO aerolinea (nombre, f_inicio_servicio_prov, servicio_aer, origen_aer, fk_cod_lug)
SELECT 'Air ' || nombre_lug, '2010-01-01', 'Comercial', 
    CASE WHEN tipo_lug = 'Pais' THEN 'Internacional' ELSE 'Nacional' END, cod_lug
FROM lugar WHERE tipo_lug IN ('Pais', 'Estado') AND nombre_lug != 'Venezuela'
ORDER BY random() LIMIT 20;

INSERT INTO crucero (nombre, f_inicio_servicio_prov, origen_cru, fk_cod_lug)
SELECT 'Royal ' || l.nombre_lug || ' Cruise', '2015-06-01', 'Internacional', l.cod_lug
FROM lugar l JOIN terminal t ON t.fk_cod_lug = l.cod_lug
WHERE t.tipo_ter = 'Puerto' ORDER BY random() LIMIT 5;

INSERT INTO terrestre (nombre, f_inicio_servicio_prov, fk_cod_lug)
SELECT 'Rent-a-Car ' || nombre_lug, '2018-01-01', cod_lug
FROM lugar WHERE tipo_lug = 'Ciudad' ORDER BY random() LIMIT 20;

INSERT INTO turistico (nombre, f_inicio_servicio_prov, tipo_servicio_tur, fk_cod_lug)
SELECT 'Tours ' || nombre_lug, '2020-01-01', 'Excursión', cod_lug
FROM lugar WHERE tipo_lug IN ('Parque', 'Estado', 'Pais') ORDER BY random() LIMIT 20;

INSERT INTO hotel (nombre_hot, direccion_hot, tipo_hot, fk_cod_lug)
(SELECT 'Hotel Gran ' || nombre_lug, 'Centro', '5 Estrellas', cod_lug FROM lugar WHERE tipo_lug = 'Estado' ORDER BY random() LIMIT 10)
UNION ALL
(SELECT 'Hotel ' || nombre_lug || ' Palace', 'Downtown', '4 Estrellas', cod_lug FROM lugar WHERE tipo_lug = 'Pais' AND nombre_lug != 'Venezuela' ORDER BY random() LIMIT 10);

INSERT INTO restaurant (nombre_res, tipo_res, ambiente_res, calificacion_res, fk_cod_lug)
SELECT 'Restaurante Sabor de ' || nombre_lug, 'Local', 'Familiar', 4, cod_lug
FROM lugar WHERE tipo_lug = 'Ciudad' ORDER BY random() LIMIT 10;

-- =============================================
-- 4. USUARIOS (CORREGIDO - SIN RANDOM EN UNIQUE KEYS)
-- =============================================
INSERT INTO rol (nombre_rol) VALUES ('Administrador'), ('Cliente'), ('Proveedor'), ('Auditor'), ('Agente');

DO $$
DECLARE
    estado RECORD;
    i INT;
    nombres TEXT[] := ARRAY['Alejandro','Maria','Carlos','Sofia','Luis','Ana','Miguel','Elena','Jose','Valentina','David','Isabella','Juan','Camila','Pedro','Valeria'];
    apellidos TEXT[] := ARRAY['Garcia','Rodriguez','Hernandez','Perez','Gonzalez','Lopez','Martinez','Suarez','Blanco','Torres','Diaz','Romero','Silva','Vargas'];
    
    v_nombre1 TEXT; v_nombre2 TEXT;
    v_apellido1 TEXT; v_apellido2 TEXT;
    v_email TEXT;
    v_pass TEXT;
    v_ci_base INT;
BEGIN
    FOR estado IN SELECT cod_lug, nombre_lug FROM lugar WHERE tipo_lug = 'Estado' LOOP
        FOR i IN 1..2 LOOP
            -- Generación de Nombres
            v_nombre1 := nombres[1 + floor(random() * array_length(nombres, 1))::int];
            v_apellido1 := apellidos[1 + floor(random() * array_length(apellidos, 1))::int];
            
            IF (random() > 0.5) THEN
                v_nombre2 := nombres[1 + floor(random() * array_length(nombres, 1))::int];
                IF v_nombre1 = v_nombre2 THEN v_nombre2 := 'Jose'; END IF;
            ELSE v_nombre2 := NULL; END IF;

            IF (random() > 0.5) THEN
                v_apellido2 := apellidos[1 + floor(random() * array_length(apellidos, 1))::int];
            ELSE v_apellido2 := NULL; END IF;

            -- Generación Determinista de ID único (Evita error Duplicate Key)
            -- Fórmula: 10 millones + (Código Estado * 1000) + índice del bucle
            v_ci_base := 10000000 + (estado.cod_lug * 1000) + i;
            
            -- Email único basado en el ID generado
            v_email := lower(v_nombre1 || '.' || v_apellido1 || v_ci_base || '@gmail.com');
            v_pass := 'Pass' || v_ci_base;  -- Plain text password (no hashing)

            INSERT INTO usuario (
                primer_nombre_usu, segundo_nombre_usu,
                primer_apellido_usu, segundo_apellido_usu,
                ci_usu, tipo_documento, n_pasaporte_usu, 
                visa_usu, millas_acum_usu, fk_cod_rol,
                email_usu, password_usu
            ) VALUES (
                v_nombre1, v_nombre2,
                v_apellido1, v_apellido2,
                v_ci_base::TEXT, 
                'V', 
                (v_ci_base + 50000000)::TEXT, -- Pasaporte también único
                (random() > 0.3), 
                floor(random() * 5000)::int, 
                2,
                v_email,
                v_pass
            );
        END LOOP;
    END LOOP;
END $$;

-- =============================================
-- 5. SERVICIOS Y PAQUETES
-- =============================================
INSERT INTO tasa_cambio (moneda, tasa_bs, fecha_hora_tas) VALUES ('USD', 45.5, NOW()), ('EUR', 49.1, NOW()), ('MIL', 1, NOW());
INSERT INTO plan_pago (nombre_pla, porcen_inicial, frecuencia_pago) VALUES ('Contado', 100, 'Unica'), ('Credito', 30, 'Mensual');

INSERT INTO servicio (nombre_ser, capacidad_ser, numero_ser, fk_cod_terminal_llega, fk_cod_terminal_sale)
SELECT 'Vuelo ' || t_sale.nombre_ter || ' -> ' || t_llega.nombre_ter, 180, 'VL-' || t_sale.cod || '-' || t_llega.cod, t_llega.cod, t_sale.cod
FROM terminal t_sale
JOIN terminal t_llega ON t_sale.cod != t_llega.cod
WHERE t_sale.tipo_ter = 'Aeropuerto' AND t_llega.tipo_ter = 'Aeropuerto'
ORDER BY random() LIMIT 50; 

INSERT INTO ser_aer (fk_servicio, fk_aerolinea)
SELECT s.cod, a.cod FROM servicio s CROSS JOIN LATERAL (SELECT cod FROM aerolinea ORDER BY random() LIMIT 1) a;

INSERT INTO paquete_turistico (nombre_paq, descripcion_paq, estado_paq, costo_millas_paq, millaje_paq, huella_de_carbono_paq, fk_cod_tasa_cambio, fk_cod_usuario, fk_cod_plan_pago)
SELECT 'Vacaciones de ' || u.primer_apellido_usu, 'Viaje familiar anual', 'Activo', 1000, 500, 100, 1, u.cod, 1 FROM usuario u;

INSERT INTO ser_paq (fk_servicio, fk_paquete, costo_ser, inicio_ser, fin_ser, millaje_ser)
SELECT (SELECT cod FROM servicio ORDER BY random() LIMIT 1), p.cod, 300, NOW(), NOW() + INTERVAL '5 days', 100 FROM paquete_turistico p;

INSERT INTO hot_paq (fk_hotel, fk_paquete, numero_habitacion_hot, inicio_estadia_hot, fin_estadia_hot, millaje_hot, costo_reserva_hot)
SELECT (SELECT cod FROM hotel ORDER BY random() LIMIT 1), p.cod, 'HB-'||floor(random()*500), NOW() + INTERVAL '1 day', NOW() + INTERVAL '5 days', 200, 500 FROM paquete_turistico p;

-- =============================================
-- 6. MÉTODOS DE PAGO
-- =============================================
INSERT INTO metodoDePago (descripcion_met, fk_usuario, tipoMetodo, n_confirm_zel, f_hora_zel, n_ref_pag, f_hora_pag)
SELECT 
    CASE WHEN (u.cod % 2) = 0 THEN 'Zelle ' || u.primer_nombre_usu ELSE 'Pago Movil Banesco' END,
    u.cod,
    CASE WHEN (u.cod % 2) = 0 THEN 'Zelle' ELSE 'PagoMovil' END,
    -- Referencias deterministas para evitar colisiones
    CASE WHEN (u.cod % 2) = 0 THEN 'Z-' || (u.cod * 12345) || '-CONF' ELSE NULL END,
    CASE WHEN (u.cod % 2) = 0 THEN NOW() ELSE NULL END,
    CASE WHEN (u.cod % 2) != 0 THEN 'PM-' || (u.cod * 67890) || '-REF' ELSE NULL END,
    CASE WHEN (u.cod % 2) != 0 THEN NOW() ELSE NULL END
FROM usuario u;

INSERT INTO usuario (email_usu,password_usu,primer_nombre_usu,segundo_nombre_usu,primer_apellido_usu,segundo_apellido_usu,ci_usu,tipo_documento,n_pasaporte_usu,visa_usu,millas_acum_usu,fk_cod_rol) 
    VALUES ('test@gmail.com','test','Test',NULL,  'User',  NULL, '99999999', 'V','99999999', false,0,1 );



INSERT INTO pago (monto_pago, fecha_pago, fk_cod_paquete, fk_metodo_pago)
SELECT 800 + floor(random()*200), NOW(), p.cod, (SELECT cod FROM metodoDePago WHERE fk_usuario=p.fk_cod_usuario LIMIT 1) 
FROM paquete_turistico p;

-- =============================================
-- 7. TABLAS DE RELLENO (10 Registros)
-- =============================================
INSERT INTO aeronave (tipo_aer, capacidad_tra, nombre_tra, fk_cod_aerolinea)
SELECT 'Airbus A320', 180, 'Avion-' || generate_series, (SELECT cod FROM aerolinea ORDER BY random() LIMIT 1) FROM generate_series(1, 20);

INSERT INTO barco (capacidad_tra, nombre_tra, fk_cod_crucero)
SELECT 2000, 'Barco-' || generate_series, (SELECT cod FROM crucero ORDER BY random() LIMIT 1) FROM generate_series(1, 10);

INSERT INTO vehiculo (capacidad_tra, nombre_tra, fk_cod_terrestre)
SELECT 4, 'Carro-' || generate_series, (SELECT cod FROM terrestre ORDER BY random() LIMIT 1) FROM generate_series(1, 20);

INSERT INTO privilegio (descripcion_priv) VALUES ('Login'), ('Crear Reserva'), ('Editar Reserva'), ('Ver Pagos'), ('Gestionar Usuarios'), ('Reportes Admin'), ('Auditoria'), ('Crear Proveedor'), ('Eliminar Proveedor'), ('Configurar Tasas');
INSERT INTO priv_rol (fk_cod_rol, fk_cod_privilegio) VALUES (1, 1), (1, 2); 

INSERT INTO auditoria (descripcion) VALUES
('Inicio de sesión exitoso'), ('Intento de sesión fallido'), ('Cambio de contraseña'), ('Compra de paquete'), ('Actualización de perfil'),
('Consulta de reporte de ventas'), ('Creación de usuario admin'), ('Eliminación de reserva'), ('Carga de pago'), ('Generación de factura');

INSERT INTO reseña (descripcion_res, rating_res, fk_cod_usuario, fk_cod_lugar, fk_cod_hotel) 
SELECT 
    (ARRAY['Excelente servicio', 'El hotel estaba sucio', 'La comida deliciosa', 'Muy buena atención', 'El vuelo se retrasó', 'Volvería a ir', 'No lo recomiendo', 'Regular', 'Increíble experiencia', 'El personal fue amable'])[floor(random()*10)+1],
    floor(random()*5)+1, 1, 1, 1 
FROM generate_series(1, 10);

INSERT INTO reclamo (descripcion_rec, estado_rec, fk_cod_usuario, fk_cod_paquete)
SELECT 
    (ARRAY['Aire acondicionado dañado', 'Maletas perdidas', 'Cobro indebido', 'Retraso excesivo', 'Habitación ruidosa', 'Sin agua caliente', 'Trato grosero', 'Reserva no encontrada', 'Comida en mal estado', 'Cancelación injustificada'])[floor(random()*10)+1],
    (ARRAY['Abierto', 'En Proceso', 'Cerrado'])[floor(random()*3)+1], 1, 1 
FROM generate_series(1, 10);

INSERT INTO tag (nombre_tag, condicion1_tag, condicional_tag, condicion2_tag, restriccion_tag) SELECT 'Tag '||g, 'C1','AND','C2', false FROM generate_series(1,10) g;
INSERT INTO promocion (tipo_pro, porcen_descuento)
SELECT 
    'Descuento del ' || (g * 5) || '%', 
    (g * 5)
FROM generate_series(1, 10) g;
INSERT INTO preferencia (descripcion_pre) VALUES ('Ventana'), ('Pasillo'), ('Comida Vegetariana'), ('Primera Clase'), ('Hotel con Piscina'), ('Vista al mar'), ('Cama King'), ('Pet Friendly'), ('Wifi de alta velocidad'), ('Transporte incluido');
INSERT INTO telefono (cod_area_tel, numero_tel, tipo_tel, fk_cod_aer) SELECT '0414', floor(random()*8999999 + 1000000)::text, 'Movil', 1 FROM generate_series(1,10) g;
INSERT INTO deseo (descripcion_des, fk_cod_usuario, fk_cod_lugar) SELECT 'Quiero visitar ' || nombre_lug, 1, cod_lug FROM lugar WHERE tipo_lug = 'Pais' LIMIT 10;