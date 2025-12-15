-- =============================================
-- SCRIPT DE LIMPIEZA TOTAL (DROP ALL)
-- =============================================
-- Advertencia: Esto borrará permanentemente todos los datos y estructuras.
-- 1. Eliminar tablas de Relaciones Intermedias y Detalles
DROP TABLE IF EXISTS ser_paq,
hot_paq,
res_paq,
ser_aer,
ser_cru,
ser_veh,
tag_paq,
tag_usu,
paq_paq,
tur_ser,
pre_usu,
pro_ser,
priv_rol,
aud_usu CASCADE;
-- 2. Eliminar tablas de Finanzas y Pagos
DROP TABLE IF EXISTS pago,
metodoDePago,
-- (y sus tablas hijas si existieran independientemente)
plan_pago,
tasa_cambio,
milla,
-- (Por si acaso se creó en versiones anteriores)
usu_met -- (Por si acaso se creó en versiones anteriores)
CASCADE;
-- 3. Eliminar tablas de Auxiliares, Reclamos y Reseñas
DROP TABLE IF EXISTS reclamo,
reseña,
deseo,
telefono,
promocion,
preferencia,
tag,
auditoria CASCADE;
-- 4. Eliminar tablas de Transporte (Flota)
DROP TABLE IF EXISTS aeronave,
barco,
vehiculo CASCADE;
-- 5. Eliminar tablas de Servicios y Paquetes
DROP TABLE IF EXISTS paquete_turistico,
servicio CASCADE;
-- 6. Eliminar tablas de Proveedores e Instalaciones
DROP TABLE IF EXISTS hotel,
restaurant,
aerolinea,
crucero,
terrestre,
turistico,
-- (Versión corregida)
tusitico -- (Por si acaso existe la versión mal escrita)
CASCADE;
-- 7. Eliminar tablas Maestras (Ubicación y Usuarios)
DROP TABLE IF EXISTS terminal,
lugar,
usuario,
rol,
privilegio CASCADE;
-- =============================================
-- 8. ELIMINAR PROCEDURES Y FUNCTIONS
-- =============================================
-- Drop all authentication procedures and functions
DROP PROCEDURE IF EXISTS authenticate_user CASCADE;
DROP FUNCTION IF EXISTS authenticate_user CASCADE;
DROP PROCEDURE IF EXISTS get_user_by_id CASCADE;
DROP FUNCTION IF EXISTS get_user_by_id CASCADE;
DROP PROCEDURE IF EXISTS email_exists CASCADE;
DROP FUNCTION IF EXISTS email_exists CASCADE;
DROP PROCEDURE IF EXISTS register_user CASCADE;
DROP FUNCTION IF EXISTS register_user CASCADE;
DROP PROCEDURE IF EXISTS update_user_password CASCADE;
DROP FUNCTION IF EXISTS update_user_password CASCADE;
DROP FUNCTION IF EXISTS get_all_services CASCADE;
DROP FUNCTION IF EXISTS get_all_hotels CASCADE;
DROP FUNCTION IF EXISTS get_all_restaurants CASCADE;
DROP PROCEDURE IF EXISTS add_item_to_package CASCADE;
DROP PROCEDURE IF EXISTS remove_item_from_package CASCADE;
DROP PROCEDURE IF EXISTS delete_package(INTEGER);
DROP PROCEDURE IF EXISTS upsert_airline(INTEGER, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP PROCEDURE IF EXISTS upsert_airline(INTEGER, VARCHAR, DATE, VARCHAR, INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS upsert_airline(
    INTEGER,
    VARCHAR,
    DATE,
    VARCHAR,
    VARCHAR,
    INTEGER
) CASCADE;
DROP PROCEDURE IF EXISTS upsert_airline(VARCHAR, VARCHAR, VARCHAR, VARCHAR, VARCHAR) CASCADE;