/*
 * SCRIPT FINAL V6 - DATA REFINEMENT
 * 1. Added Cruise Services (Cruceros).
 * 2. Enhanced Reviews with specific text.
 * 3. Varied package costs and dates for 2024 realism.
 */
-- =============================================
-- 0. LIMPIEZA TOTAL
-- =============================================
TRUNCATE TABLE aud_usu,
auditoria,
pago,
metodoDePago,
pro_ser,
pre_usu,
tur_ser,
paq_paq,
tag_usu,
tag_paq,
tag,
preferencia,
promocion,
reseña,
reclamo,
deseo,
telefono,
res_paq,
ser_veh,
ser_cru,
ser_aer,
hot_paq,
ser_paq,
paquete_turistico,
plan_pago,
tasa_cambio,
servicio,
vehiculo,
barco,
aeronave,
restaurant,
hotel,
turistico,
terrestre,
crucero,
aerolinea,
terminal,
usuario,
priv_rol,
privilegio,
rol,
lugar RESTART IDENTITY CASCADE;
-- =============================================
-- 1. GEOGRAFÍA
-- =============================================
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre)
VALUES ('America', 'Continente', NULL),
    ('Europa', 'Continente', NULL),
    ('Asia', 'Continente', NULL),
    ('Africa', 'Continente', NULL),
    ('Oceania', 'Continente', NULL);
-- Países
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre)
VALUES ('Estados Unidos', 'Pais', 1),
    ('México', 'Pais', 1),
    ('Brasil', 'Pais', 1),
    ('Argentina', 'Pais', 1),
    ('Canadá', 'Pais', 1),
    ('España', 'Pais', 2),
    ('Francia', 'Pais', 2),
    ('Italia', 'Pais', 2),
    ('Alemania', 'Pais', 2),
    ('Reino Unido', 'Pais', 2),
    ('Japón', 'Pais', 3),
    ('China', 'Pais', 3),
    ('India', 'Pais', 3),
    ('Tailandia', 'Pais', 3),
    ('Corea del Sur', 'Pais', 3),
    ('Egipto', 'Pais', 4),
    ('Sudáfrica', 'Pais', 4),
    ('Marruecos', 'Pais', 4),
    ('Kenia', 'Pais', 4),
    ('Nigeria', 'Pais', 4),
    ('Australia', 'Pais', 5),
    ('Nueva Zelanda', 'Pais', 5),
    ('Fiji', 'Pais', 5),
    ('Samoa', 'Pais', 5),
    ('Tonga', 'Pais', 5);
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre)
VALUES ('Venezuela', 'Pais', 1);
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre)
SELECT unnest(
        ARRAY [
    'Distrito Capital', 'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 
    'Cojedes', 'Delta Amacuro', 'Falcón', 'Guárico', 'Lara', 'Mérida', 'Miranda', 'Monagas', 
    'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'La Guaira', 'Yaracuy', 'Zulia'
]
    ),
    'Estado',
    (
        SELECT cod_lug
        FROM lugar
        WHERE nombre_lug = 'Venezuela'
    );
-- Ciudades
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre)
SELECT 'Ciudad de ' || nombre_lug,
    'Ciudad',
    cod_lug
FROM lugar
WHERE tipo_lug IN ('Pais', 'Estado')
    AND nombre_lug != 'Venezuela';
-- Parques
INSERT INTO lugar (nombre_lug, tipo_lug, fk_cod_lug_padre)
VALUES (
        'Central Park',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Parque Güell',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'España'
        )
    ),
    (
        'Monte Fuji',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Japón'
        )
    ),
    (
        'Gran Barrera de Coral',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Australia'
        )
    ),
    (
        'Serengeti',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Kenia'
        )
    ),
    (
        'Canaima',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Bolívar'
        )
    ),
    (
        'Morrocoy',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Falcón'
        )
    ),
    (
        'El Ávila',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Distrito Capital'
        )
    ),
    (
        'Mochima',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Sucre'
        )
    ),
    (
        'Sierra Nevada',
        'Parque',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Mérida'
        )
    );
-- =============================================
-- 2. INFRAESTRUCTURA
-- =============================================
INSERT INTO terminal (nombre_ter, tipo_ter, fk_cod_lug)
SELECT 'Aeropuerto Intl ' || nombre_lug,
    'Aeropuerto',
    cod_lug
FROM lugar
WHERE tipo_lug IN ('Pais', 'Estado')
    AND nombre_lug != 'Venezuela';
INSERT INTO terminal (nombre_ter, tipo_ter, fk_cod_lug)
SELECT 'Puerto de ' || nombre_lug,
    'Puerto',
    cod_lug
FROM lugar
WHERE nombre_lug IN (
        'España',
        'Italia',
        'Australia',
        'Fiji',
        'La Guaira',
        'Nueva Esparta',
        'Anzoátegui',
        'Sucre',
        'Falcón',
        'Estados Unidos'
    )
LIMIT 10;
-- =============================================
-- 3. PROVEEDORES (REALISTIC)
-- =============================================
-- Aerolíneas
INSERT INTO aerolinea (
        nombre,
        f_inicio_servicio_prov,
        servicio_aer,
        origen_aer,
        fk_cod_lug
    )
VALUES (
        'American Airlines',
        '1930-01-01',
        'Comercial',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Lufthansa',
        '1953-01-01',
        'Comercial',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Alemania'
        )
    ),
    (
        'Air France',
        '1933-01-01',
        'Comercial',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Francia'
        )
    ),
    (
        'Conviasa',
        '2004-01-01',
        'Comercial',
        'Nacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Distrito Capital'
        )
    ),
    (
        'Avior Airlines',
        '1994-01-01',
        'Comercial',
        'Nacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Anzoátegui'
        )
    ),
    (
        'Laser Airlines',
        '1994-01-01',
        'Comercial',
        'Nacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Miranda'
        )
    ),
    (
        'Iberia',
        '1927-01-01',
        'Comercial',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'España'
        )
    ),
    (
        'Qatar Airways',
        '1993-01-01',
        'Comercial',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'India'
        )
    ),
    (
        'Emirates',
        '1985-01-01',
        'Comercial',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Tailandia'
        )
    ),
    (
        'Copa Airlines',
        '1947-01-01',
        'Comercial',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'España'
        )
    );
-- Cruceros
INSERT INTO crucero (
        nombre,
        f_inicio_servicio_prov,
        origen_cru,
        fk_cod_lug
    )
VALUES (
        'Royal Caribbean',
        '1968-01-01',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'MSC Cruises',
        '1989-01-01',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Italia'
        )
    ),
    (
        'Norwegian Cruise Line',
        '1966-01-01',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Carnival Cruise Line',
        '1972-01-01',
        'Internacional',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    );
-- Terrestre (Alquiler de Vehículos)
INSERT INTO terrestre (nombre, f_inicio_servicio_prov, fk_cod_lug)
VALUES (
        'Hertz Rent a Car',
        '1918-01-01',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Avis Car Rental',
        '1946-01-01',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Sixt Rent a Car',
        '1912-01-01',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Alemania'
        )
    ),
    (
        'Budget Rent a Car',
        '1958-01-01',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Europcar',
        '1949-01-01',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Francia'
        )
    ),
    (
        'Enterprise Rent-A-Car',
        '1957-01-01',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Alamo Rent A Car',
        '1974-01-01',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Localiza',
        '1973-01-01',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Brasil'
        )
    );
-- Turístico (Operadores de Tours)
INSERT INTO turistico (
        nombre,
        f_inicio_servicio_prov,
        tipo_servicio_tur,
        fk_cod_lug
    )
VALUES (
        'Viator Tours',
        '1995-01-01',
        'Plataforma',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'GetYourGuide',
        '2009-01-01',
        'Plataforma',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Alemania'
        )
    ),
    (
        'Gray Line Tours',
        '1910-01-01',
        'Excursión',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Estados Unidos'
        )
    ),
    (
        'Tours Venezuela VIP',
        '2015-01-01',
        'Aventura',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Venezuela'
        )
    ),
    (
        'Canaima Tours',
        '2010-01-01',
        'Aventura',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Bolívar'
        )
    ),
    (
        'Los Roques Paradise',
        '2012-01-01',
        'Playa',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'La Guaira'
        )
    ),
    (
        'Safari Adventures Kenya',
        '2000-01-01',
        'Safari',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Kenia'
        )
    ),
    (
        'EuroTrip Operators',
        '2005-01-01',
        'Cultural',
        (
            SELECT cod_lug
            FROM lugar
            WHERE nombre_lug = 'Europa'
        )
    );
INSERT INTO hotel (nombre_hot, direccion_hot, tipo_hot, fk_cod_lug) (
        SELECT 'Hotel Gran ' || nombre_lug,
            'Centro',
            '5 Estrellas',
            cod_lug
        FROM lugar
        WHERE tipo_lug = 'Estado'
        ORDER BY random()
        LIMIT 10
    )
UNION ALL
(
    SELECT 'Hilton ' || nombre_lug,
        'Business District',
        '5 Estrellas',
        cod_lug
    FROM lugar
    WHERE tipo_lug = 'Pais'
    LIMIT 5
)
UNION ALL
(
    SELECT 'Marriott ' || nombre_lug,
        'City Center',
        '4 Estrellas',
        cod_lug
    FROM lugar
    WHERE tipo_lug = 'Pais'
    LIMIT 5
);
INSERT INTO restaurant (
        nombre_res,
        tipo_res,
        ambiente_res,
        calificacion_res,
        fk_cod_lug
    )
SELECT 'Bistro ' || nombre_lug,
    'Gourmet',
    'Elegante',
    5,
    cod_lug
FROM lugar
WHERE tipo_lug = 'Ciudad'
ORDER BY random()
LIMIT 10;
-- =============================================
-- 4. FLOTA (Vehículos para agencias)
-- =============================================
INSERT INTO aeronave (
        tipo_aer,
        capacidad_tra,
        nombre_tra,
        fk_cod_aerolinea
    )
SELECT 'Boeing 737',
    160,
    'YV-' || generate_series,
    (
        SELECT cod
        FROM aerolinea
        ORDER BY random()
        LIMIT 1
    )
FROM generate_series(100, 120);
INSERT INTO barco (capacidad_tra, nombre_tra, fk_cod_crucero)
SELECT 3000,
    'Sea Voyager ' || generate_series,
    (
        SELECT cod
        FROM crucero
        ORDER BY random()
        LIMIT 1
    )
FROM generate_series(1, 5);
-- Cada agencia de alquiler tiene vehiculos
INSERT INTO vehiculo (capacidad_tra, nombre_tra, fk_cod_terrestre)
SELECT (ARRAY [4, 5, 7]) [floor(random()*3)+1],
    (
        ARRAY ['Toyota Corolla', 'Ford Explorer', 'Chevrolet Aveo', 'Nissan Sentra']
    ) [floor(random()*4)+1] || ' #' || generate_series,
    t.cod
FROM terrestre t
    CROSS JOIN generate_series(1, 5);
-- 5 cars per agency
-- =============================================
-- 5. USUARIOS
-- =============================================
INSERT INTO rol (nombre_rol)
VALUES ('Administrador'),
    ('Cliente'),
    ('Proveedor'),
    ('Auditor'),
    ('Agente');
DO $$
DECLARE estado RECORD;
i INT;
nombres TEXT [] := ARRAY ['Alejandro','Maria','Carlos','Sofia','Luis','Ana','Miguel','Elena','Jose','Valentina','David','Isabella','Juan','Camila','Pedro','Valeria'];
apellidos TEXT [] := ARRAY ['Garcia','Rodriguez','Hernandez','Perez','Gonzalez','Lopez','Martinez','Suarez','Blanco','Torres','Diaz','Romero','Silva','Vargas'];
v_nombre1 TEXT;
v_nombre2 TEXT;
v_apellido1 TEXT;
v_apellido2 TEXT;
v_email TEXT;
v_pass TEXT;
v_ci_base INT;
v_birth DATE;
BEGIN FOR estado IN
SELECT cod_lug,
    nombre_lug
FROM lugar
WHERE tipo_lug = 'Estado' LOOP FOR i IN 1..4 LOOP v_nombre1 := nombres [1 + floor(random() * array_length(nombres, 1))::int];
v_apellido1 := apellidos [1 + floor(random() * array_length(apellidos, 1))::int];
IF (random() > 0.5) THEN v_nombre2 := nombres [1 + floor(random() * array_length(nombres, 1))::int];
IF v_nombre1 = v_nombre2 THEN v_nombre2 := 'Jose';
END IF;
ELSE v_nombre2 := NULL;
END IF;
IF (random() > 0.5) THEN v_apellido2 := apellidos [1 + floor(random() * array_length(apellidos, 1))::int];
ELSE v_apellido2 := NULL;
END IF;
v_ci_base := 10000000 + (estado.cod_lug * 1000) + i;
v_email := lower(
    v_nombre1 || '.' || v_apellido1 || v_ci_base || '@gmail.com'
);
v_pass := 'Pass' || v_ci_base;
v_birth := '1950-01-01'::DATE + (floor(random() * 20000) || ' days')::interval;
-- Random 1950-2005
INSERT INTO usuario (
        primer_nombre_usu,
        segundo_nombre_usu,
        primer_apellido_usu,
        segundo_apellido_usu,
        ci_usu,
        tipo_documento,
        n_pasaporte_usu,
        visa_usu,
        millas_acum_usu,
        fk_cod_rol,
        email_usu,
        password_usu,
        fecha_nacimiento
    )
VALUES (
        v_nombre1,
        v_nombre2,
        v_apellido1,
        v_apellido2,
        v_ci_base::TEXT,
        'V',
        (v_ci_base + 50000000)::TEXT,
        (random() > 0.3),
        floor(random() * 5000)::int,
        2,
        v_email,
        v_pass,
        v_birth
    );
END LOOP;
END LOOP;
END $$;
-- =============================================
-- 6. TASAS CAMBIO
-- =============================================
INSERT INTO tasa_cambio (moneda, tasa_bs, fecha_hora_tas)
SELECT 'USD',
    35.0 + (g * 0.5) + (random() * 2),
    CAST('2024-01-01' AS TIMESTAMP) + (g || ' weeks')::interval
FROM generate_series(0, 50) g;
INSERT INTO tasa_cambio (moneda, tasa_bs, fecha_hora_tas)
SELECT 'EUR',
    38.0 + (g * 0.6) + (random() * 2),
    CAST('2024-01-01' AS TIMESTAMP) + (g || ' weeks')::interval
FROM generate_series(0, 50) g;
INSERT INTO tasa_cambio (moneda, tasa_bs, fecha_hora_tas)
VALUES ('USD', 45.5, NOW()),
    ('EUR', 49.1, NOW()),
    ('MIL', 1, NOW());
-- =============================================
-- 7. SERVICIOS Y PAQUETES (MIXED TYPES INCL CRUISES)
-- =============================================
INSERT INTO plan_pago (nombre_pla, porcen_inicial, frecuencia_pago)
VALUES ('Contado', 100, 'Unica'),
    ('Credito', 30, 'Mensual');
-- 7.1 Vuelos (Flights)
INSERT INTO servicio (
        nombre_ser,
        capacidad_ser,
        numero_ser,
        fk_cod_terminal_llega,
        fk_cod_terminal_sale
    )
SELECT 'Vuelo ' || t_sale.nombre_ter || ' -> ' || t_llega.nombre_ter,
    180,
    'VL-' || t_sale.cod || '-' || t_llega.cod,
    t_llega.cod,
    t_sale.cod
FROM terminal t_sale
    JOIN terminal t_llega ON t_sale.cod != t_llega.cod
WHERE t_sale.tipo_ter = 'Aeropuerto'
    AND t_llega.tipo_ter = 'Aeropuerto'
ORDER BY random()
LIMIT 40;
INSERT INTO ser_aer (fk_servicio, fk_aerolinea)
SELECT s.cod,
    a.cod
FROM servicio s
    CROSS JOIN LATERAL (
        SELECT cod
        FROM aerolinea
        ORDER BY random()
        LIMIT 1
    ) a
WHERE s.nombre_ser LIKE 'Vuelo%';
-- 7.2 Tours Excursions
INSERT INTO servicio (
        nombre_ser,
        capacidad_ser,
        numero_ser,
        fk_cod_terminal_llega,
        fk_cod_terminal_sale
    )
SELECT 'Tour ' || tu.nombre,
    20,
    'TR-' || tu.cod || '-' || floor(random() * 1000),
    t.cod,
    t.cod
FROM turistico tu
    JOIN terminal t ON t.fk_cod_lug = tu.fk_cod_lug -- Terminal in same location as tour
LIMIT 30;
INSERT INTO tur_ser (fk_turistico, fk_servicio)
SELECT tu.cod,
    s.cod
FROM servicio s
    JOIN turistico tu ON s.nombre_ser LIKE ('Tour ' || tu.nombre);
-- 7.3 Car Rentals
INSERT INTO servicio (
        nombre_ser,
        capacidad_ser,
        numero_ser,
        fk_cod_terminal_llega,
        fk_cod_terminal_sale
    )
SELECT 'Alquiler ' || v.nombre_tra,
    v.capacidad_tra,
    'CR-' || v.cod || '-' || floor(random() * 1000),
    (
        SELECT cod
        FROM terminal
        ORDER BY random()
        LIMIT 1
    ), (
        SELECT cod
        FROM terminal
        ORDER BY random()
        LIMIT 1
    )
FROM vehiculo v
ORDER BY random()
LIMIT 30;
INSERT INTO ser_veh (fk_vehiculo, fk_servicio)
SELECT v.cod,
    s.cod
FROM servicio s
    JOIN vehiculo v ON s.nombre_ser = ('Alquiler ' || v.nombre_tra);
-- 7.4 Cruises (Cruceros)
INSERT INTO servicio (
        nombre_ser,
        capacidad_ser,
        numero_ser,
        fk_cod_terminal_llega,
        fk_cod_terminal_sale
    )
SELECT 'Crucero ' || b.nombre_tra,
    b.capacidad_tra,
    'SEA-' || b.cod || '-' || floor(random() * 1000),
    (
        SELECT cod
        FROM terminal
        WHERE tipo_ter = 'Puerto'
        ORDER BY random()
        LIMIT 1
    ), (
        SELECT cod
        FROM terminal
        WHERE tipo_ter = 'Puerto'
        ORDER BY random()
        LIMIT 1
    )
FROM barco b
ORDER BY random()
LIMIT 10;
INSERT INTO ser_cru (fk_crucero, fk_servicio)
SELECT b.fk_cod_crucero,
    s.cod
FROM servicio s
    JOIN barco b ON s.nombre_ser LIKE ('Crucero ' || b.nombre_tra);
-- Paquetes
INSERT INTO paquete_turistico (
        nombre_paq,
        descripcion_paq,
        estado_paq,
        costo_millas_paq,
        millaje_paq,
        huella_de_carbono_paq,
        fk_cod_tasa_cambio,
        fk_cod_usuario,
        fk_cod_plan_pago,
        fecha_cancelacion
    )
SELECT 'Vacaciones de ' || u.primer_apellido_usu,
    'Viaje familiar 2024',
    CASE
        WHEN random() < 0.2 THEN 'Cancelled'
        ELSE 'Activo'
    END,
    1000,
    500,
    100,
    (
        SELECT cod
        FROM tasa_cambio
        WHERE moneda = 'USD'
        ORDER BY random()
        LIMIT 1
    ), u.cod, 1, CASE
        WHEN random() < 0.2 THEN (
            CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
        )
        ELSE NULL
    END
FROM usuario u;
UPDATE paquete_turistico
SET fecha_cancelacion = NULL
WHERE estado_paq != 'Cancelled';
UPDATE paquete_turistico
SET fecha_cancelacion = (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    )
WHERE estado_paq = 'Cancelled'
    AND fecha_cancelacion IS NULL;
-- Link Services to Packages (Ensure mix of Flights, Tours, Rentals, Cruises)
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
SELECT s.cod,
    p.cod,
    CASE
        WHEN s.nombre_ser LIKE 'Vuelo%' THEN 300 + floor(random() * 200) -- Flight Cost
        WHEN s.nombre_ser LIKE 'Crucero%' THEN 800 + floor(random() * 500) -- Cruise Cost (High value)
        WHEN s.nombre_ser LIKE 'Tour%' THEN 100 + floor(random() * 150) -- Tour Cost
        WHEN s.nombre_ser LIKE 'Alquiler%' THEN 50 + floor(random() * 100) -- Rental Cost
        ELSE 150
    END,
    (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    ),
    (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    ) + INTERVAL '5 days',
    100,
    u.primer_nombre_usu,
    u.primer_apellido_usu,
    u.n_pasaporte_usu,
    u.fecha_nacimiento
FROM paquete_turistico p
    JOIN usuario u ON p.fk_cod_usuario = u.cod
    JOIN servicio s ON s.cod = (
        SELECT cod
        FROM servicio
        ORDER BY random()
        LIMIT 1
    );
-- Random service per package
-- Add EXTRA services per package (Tours/Rentals likely)
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
SELECT s.cod,
    p.cod,
    120,
    (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    ),
    (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    ) + INTERVAL '3 days',
    50,
    u.primer_nombre_usu,
    u.primer_apellido_usu,
    u.n_pasaporte_usu,
    u.fecha_nacimiento
FROM paquete_turistico p
    JOIN usuario u ON p.fk_cod_usuario = u.cod
    JOIN servicio s ON s.cod = (
        SELECT cod
        FROM servicio
        WHERE nombre_ser LIKE 'Tour%'
            OR nombre_ser LIKE 'Alquiler%'
        ORDER BY random()
        LIMIT 1
    )
WHERE random() > 0.4;
-- =============================================
-- 8. PAGO Y METODOS
-- =============================================
INSERT INTO metodoDePago (
        descripcion_met,
        fk_usuario,
        tipoMetodo,
        n_confirm_zel,
        f_hora_zel,
        n_ref_pag,
        f_hora_pag
    )
SELECT CASE
        WHEN (u.cod % 2) = 0 THEN 'Zelle ' || u.primer_nombre_usu
        ELSE 'Pago Movil Banesco'
    END,
    u.cod,
    CASE
        WHEN (u.cod % 2) = 0 THEN 'Zelle'
        ELSE 'PagoMovil'
    END,
    CASE
        WHEN (u.cod % 2) = 0 THEN 'Z-' || (u.cod * 12345) || '-CONF'
        ELSE NULL
    END,
    CASE
        WHEN (u.cod % 2) = 0 THEN CAST('2024-01-01' AS TIMESTAMP) + (floor(random() * 350) || ' days')::interval
        ELSE NULL
    END,
    CASE
        WHEN (u.cod % 2) != 0 THEN 'PM-' || (u.cod * 67890) || '-REF'
        ELSE NULL
    END,
    CASE
        WHEN (u.cod % 2) != 0 THEN CAST('2024-01-01' AS TIMESTAMP) + (floor(random() * 350) || ' days')::interval
        ELSE NULL
    END
FROM usuario u;
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
        millas_acum_usu,
        fk_cod_rol,
        fecha_nacimiento
    )
VALUES (
        'test@gmail.com',
        'test',
        'Test',
        NULL,
        'User',
        NULL,
        '99999999',
        'V',
        '99999999',
        false,
        0,
        1,
        '1990-01-01'
    );
INSERT INTO pago (
        monto_pago,
        fecha_pago,
        fk_cod_paquete,
        fk_metodo_pago
    )
SELECT 1500,
    CAST('2024-01-01' AS TIMESTAMP) + (floor(random() * 350) || ' days')::interval,
    p.cod,
    (
        SELECT cod
        FROM metodoDePago
        WHERE fk_usuario = p.fk_cod_usuario
        LIMIT 1
    )
FROM paquete_turistico p;
-- =============================================
-- 9. REVIEWS & OTHERS (AUTHENTIC REVIEWS)
-- =============================================
INSERT INTO hot_paq (
        fk_hotel,
        fk_paquete,
        numero_habitacion_hot,
        inicio_estadia_hot,
        fin_estadia_hot,
        millaje_hot,
        costo_reserva_hot
    )
SELECT (
        SELECT cod
        FROM hotel
        ORDER BY random()
        LIMIT 1
    ), p.cod, 'HB-' || floor(random() * 500), (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    ),
    (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    ) + INTERVAL '5 days',
    200,
    500
FROM paquete_turistico p;
INSERT INTO res_paq (
        fk_restaurant,
        fk_paquete,
        numero_reservacion_res,
        inicio_reserva_res,
        fin_reserva_res,
        millaje_res,
        costo_reserva_res
    )
SELECT (
        SELECT cod
        FROM restaurant
        ORDER BY random()
        LIMIT 1
    ), p.cod, 'RES-' || floor(random() * 500), (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    ),
    (
        CAST('2024-01-01' AS DATE) + (floor(random() * 300) || ' days')::interval
    ) + INTERVAL '2 hours',
    50,
    150
FROM paquete_turistico p
LIMIT 20;
INSERT INTO reseña (
        descripcion_res,
        rating_res,
        fk_cod_usuario,
        fk_cod_lugar,
        fk_cod_hotel
    )
SELECT (
        ARRAY [
        'Absolutely stunning views and excellent service. Will come again!', 
        'Room was dirty and AC did not work. Very disappointed.', 
        'Great location but the staff was a bit rude.', 
        'Breakfast was amazing! Best pancakes ever.', 
        'Too noisy at night, could not sleep.', 
        'Perfect for a family vacation. Kids loved the pool.',
        'Overpriced for what you get. Wifi was terrible.',
        'Clean, comfortable, and friendly. Highly recommended.',
        'Found a cockroach in the bathroom. Never returning.',
        'Review pending.'
    ]
    ) [floor(random()*10)+1],
    (ARRAY [5, 1, 3, 5, 2, 5, 2, 4, 1, 3]) [floor(random()*10)+1],
    (
        SELECT fk_cod_usuario
        FROM paquete_turistico
        WHERE cod = hp.fk_paquete
    ),
    1,
    hp.fk_hotel
FROM hot_paq hp
WHERE random() > 0.3 -- 70% of stays get a review
ORDER BY random()
LIMIT 100;
INSERT INTO reclamo (
        descripcion_rec,
        estado_rec,
        fk_cod_usuario,
        fk_cod_paquete
    )
SELECT (
        ARRAY ['Refund not processed.', 'Service was poor.', 'Guide was late.', 'Hidden fees.', 'Flight cancelled.', 'Lost luggage.', 'Rude staff.', 'Booking error.', 'Wrong dates.', 'Overbooking.']
    ) [floor(random()*10)+1],
    'Abierto',
    u.cod,
    (
        SELECT cod
        FROM paquete_turistico
        WHERE fk_cod_usuario = u.cod
        LIMIT 1
    )
FROM usuario u
WHERE (
        SELECT count(*)
        FROM paquete_turistico
        WHERE fk_cod_usuario = u.cod
    ) > 0
LIMIT 15;
INSERT INTO tag (
        nombre_tag,
        condicion1_tag,
        condicional_tag,
        condicion2_tag,
        restriccion_tag
    )
SELECT 'Tag ' || g,
    'C1',
    'AND',
    'C2',
    false
FROM generate_series(1, 10) g;
INSERT INTO promocion (tipo_pro, porcen_descuento)
VALUES ('Summer Sale', 15),
    ('Winter Deal', 20),
    ('Black Friday', 30),
    ('Welcome Promo', 10),
    ('VIP Discount', 25),
    ('Early Bird', 12),
    ('Last Minute', 40),
    ('Family Pack', 18),
    ('Student Disc', 15),
    ('Honeymoon Special', 22);
INSERT INTO pro_ser (
        fk_promocion,
        fk_servicio,
        fecha_inicio,
        fecha_fin
    )
SELECT p.cod,
    s.cod,
    '2024-01-01',
    '2024-12-31'
FROM promocion p
    CROSS JOIN LATERAL (
        SELECT cod
        FROM servicio
        ORDER BY random()
        LIMIT 2
    ) s;
INSERT INTO preferencia (descripcion_pre)
VALUES ('Ventana'),
    ('Pasillo'),
    ('Comida Vegetariana'),
    ('Sin Gluten'),
    ('Asiento Extra'),
    ('Primera Clase'),
    ('Hotel 5 Estrellas'),
    ('Vista al Mar'),
    ('Cama King'),
    ('Transporte Privado');
INSERT INTO telefono (cod_area_tel, numero_tel, tipo_tel, fk_cod_aer)
SELECT '0414',
    floor(random() * 9000000) + 1000000,
    'Movil',
    a.cod
FROM aerolinea a
LIMIT 10;
INSERT INTO deseo (descripcion_des, fk_cod_usuario, fk_cod_lugar)
SELECT 'Visitar ' || nombre_lug,
    1,
    cod_lug
FROM lugar
WHERE tipo_lug = 'Pais'
LIMIT 10;
-- Clean up trigger-generated audits so we only have the manual sample ones
TRUNCATE TABLE aud_usu RESTART IDENTITY CASCADE;
-- Manual Audits with Users (fixing missing user issue)
INSERT INTO auditoria (descripcion)
VALUES ('User Login'),
    ('Create Package'),
    ('Update Profile'),
    ('Search Flight'),
    ('View Reports');
INSERT INTO aud_usu (fk_usuario, fk_auditoria, fecha_hora)
SELECT u.cod,
    (
        SELECT cod
        FROM auditoria
        ORDER BY random()
        LIMIT 1
    ), NOW() - (floor(random() * 30) || ' days')::interval
FROM usuario u
LIMIT 20;
-- =============================================
-- 10. PRIVILEGIOS Y ASIGNACIONES POR ROL
-- =============================================
-- Insertar los 26 privilegios organizados en 7 categorías
INSERT INTO privilegio (descripcion_priv)
VALUES -- Airline Management (4)
    ('create_airline'),
    ('edit_airline'),
    ('delete_airline'),
    ('view_airlines'),
    -- Package Management (4)
    ('create_package'),
    ('edit_package'),
    ('delete_package'),
    ('view_packages'),
    -- Booking Management (4)
    ('create_booking'),
    ('edit_booking'),
    ('cancel_booking'),
    ('view_bookings'),
    -- User Management (4)
    ('create_user'),
    ('edit_user'),
    ('delete_user'),
    ('view_users'),
    -- Reports & Analytics (3)
    ('view_reports'),
    ('export_reports'),
    ('view_analytics'),
    -- Promotions (4)
    ('create_promotion'),
    ('edit_promotion'),
    ('delete_promotion'),
    ('view_promotions'),
    -- System Administration (3)
    ('manage_settings'),
    ('manage_roles'),
    ('view_audit_logs');
-- Asignar TODOS los privilegios al Administrador (cod_rol = 1)
INSERT INTO priv_rol (fk_cod_rol, fk_cod_privilegio)
SELECT 1,
    cod
FROM privilegio;
-- Asignar privilegios al Agente (cod_rol = 5)
-- view_users, view_reports, view_promotions, view_airlines, view_packages, create_booking, edit_booking, view_bookings
INSERT INTO priv_rol (fk_cod_rol, fk_cod_privilegio)
SELECT 5,
    cod
FROM privilegio
WHERE descripcion_priv IN (
        'view_users',
        'view_reports',
        'view_promotions',
        'view_airlines',
        'view_packages',
        'create_booking',
        'edit_booking',
        'view_bookings'
    );
-- Asignar privilegios al Cliente (cod_rol = 2)
-- view_packages, view_bookings, view_promotions
INSERT INTO priv_rol (fk_cod_rol, fk_cod_privilegio)
SELECT 2,
    cod
FROM privilegio
WHERE descripcion_priv IN (
        'view_packages',
        'view_bookings',
        'view_promotions'
    );