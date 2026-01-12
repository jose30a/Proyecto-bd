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
car_usu,
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
usu_met CASCADE;
-- 3. Eliminar tablas de Auxiliares, Reclamos y Reseñas
DROP TABLE IF EXISTS reclamo,
reseña,
deseo,
telefono,
promocion,
caracteristica,
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
DROP FUNCTION IF EXISTS get_countries() CASCADE;
DROP FUNCTION IF EXISTS get_cities(INTEGER) CASCADE;
-- Moved to section 15 for consistency
-- Limpieza general de funciones de autenticación
DROP PROCEDURE IF EXISTS authenticate_user CASCADE;
DROP FUNCTION IF EXISTS authenticate_user CASCADE;
DROP PROCEDURE IF EXISTS get_user_by_id CASCADE;
DROP FUNCTION IF EXISTS get_user_by_id CASCADE;
DROP PROCEDURE IF EXISTS email_exists CASCADE;
DROP FUNCTION IF EXISTS email_exists CASCADE;
DROP PROCEDURE IF EXISTS register_user CASCADE;
DROP PROCEDURE IF EXISTS update_user_password CASCADE;
-- Limpieza movida desde create.sql (Específicos)
DROP FUNCTION IF EXISTS get_all_users() CASCADE;
DROP PROCEDURE IF EXISTS update_user_role(INTEGER, VARCHAR) CASCADE;
DROP PROCEDURE IF EXISTS update_user_details(
    INTEGER,
    VARCHAR,
    VARCHAR,
    VARCHAR,
    VARCHAR,
    VARCHAR
) CASCADE;
DROP FUNCTION IF EXISTS get_all_roles() CASCADE;
DROP FUNCTION IF EXISTS get_all_packages() CASCADE;
DROP PROCEDURE IF EXISTS upsert_package(
    INTEGER,
    VARCHAR,
    TEXT,
    VARCHAR,
    INTEGER,
    INTEGER,
    DECIMAL
) CASCADE;
DROP PROCEDURE IF EXISTS delete_package(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_package_details(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_all_airlines() CASCADE;
DROP FUNCTION IF EXISTS get_airline_contacts(INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS upsert_airline(INTEGER, VARCHAR, VARCHAR, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_all_promotions() CASCADE;
DROP FUNCTION IF EXISTS get_payment_plans() CASCADE;
DROP PROCEDURE IF EXISTS upsert_promotion(INTEGER, VARCHAR, INTEGER) CASCADE;
-- Old versions are handled in general drops or specific section below
-- Old airline and promotion drops moved/consolidated
DROP PROCEDURE IF EXISTS delete_airline(INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS delete_promotion(INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS delete_airline(INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS upsert_contact_number(INTEGER, INTEGER, VARCHAR, VARCHAR, VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS get_negative_reviews(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_exchange_rates_history(DATE, DATE) CASCADE;
-- =============================================
-- REPORTS & ANALYTICS DROPS
-- =============================================
DROP FUNCTION IF EXISTS get_exchange_rates_history(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_operator_performance(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_refunds_audit(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_customer_age_distribution(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_customer_average_age(DATE, DATE) CASCADE;
DROP FUNCTION IF EXISTS get_dashboard_stats() CASCADE;
DROP FUNCTION IF EXISTS get_negative_reviews(DATE, DATE) CASCADE;
-- =============================================
-- TRIGGERS & HELPERS DROPS
-- =============================================
-- Airline Upsert Helper
DROP TRIGGER IF EXISTS trg_before_upsert_aerolinea ON aerolinea;
DROP FUNCTION IF EXISTS before_upsert_aerolinea() CASCADE;
-- Package Defaults Helper
DROP TRIGGER IF EXISTS trg_before_insert_paquete ON paquete_turistico;
DROP FUNCTION IF EXISTS before_insert_paquete_turistico() CASCADE;
-- Placeholder Promotion Helper
DROP TRIGGER IF EXISTS trg_after_insert_paquete ON paquete_turistico;
DROP FUNCTION IF EXISTS after_insert_paquete_turistico() CASCADE;
-- Service Management
DROP FUNCTION IF EXISTS get_all_services() CASCADE;
DROP FUNCTION IF EXISTS get_all_hotels() CASCADE;
DROP FUNCTION IF EXISTS get_all_restaurants() CASCADE;
DROP PROCEDURE IF EXISTS add_item_to_package(INTEGER, INTEGER, VARCHAR, DATE, DATE) CASCADE;
DROP PROCEDURE IF EXISTS remove_item_from_package(INTEGER, INTEGER, VARCHAR) CASCADE;
DROP PROCEDURE IF EXISTS add_child_package(INTEGER, INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS remove_child_package(INTEGER, INTEGER) CASCADE;
-- =============================================
-- DECOMMISSIONED OBJECTS (Auditing System)
-- =============================================
DROP FUNCTION IF EXISTS record_audit(TEXT) CASCADE;
DROP FUNCTION IF EXISTS audit_fn_aerolinea_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_aerolinea_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_aerolinea_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_paquete_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_paquete_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_paquete_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_promocion_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_promocion_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_promocion_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_servicio_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_servicio_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_servicio_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_hotel_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_hotel_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_hotel_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_restaurant_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_restaurant_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_restaurant_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_pago_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_pago_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_pago_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_metodopago_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_metodopago_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_metodopago_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_telefono_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_telefono_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_telefono_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_reclamo_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_reclamo_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_reclamo_resolve() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_resena_insert() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_resena_update() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_resena_delete() CASCADE;
DROP FUNCTION IF EXISTS audit_fn_usuario_update_role() CASCADE;
-- =============================================
-- PRIVILEGE & SECURITY DROPS
-- =============================================
DROP FUNCTION IF EXISTS get_all_privileges() CASCADE;
DROP FUNCTION IF EXISTS get_role_privileges(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS user_has_privilege(INTEGER, VARCHAR) CASCADE;
DROP PROCEDURE IF EXISTS assign_privilege_to_role(INTEGER, INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS remove_privilege_from_role(INTEGER, INTEGER) CASCADE;
-- =============================================
-- PROMOTION ASSIGNMENT DROPS
-- =============================================
DROP PROCEDURE IF EXISTS assign_promotion_to_service(INTEGER, INTEGER, DATE, DATE) CASCADE;
DROP PROCEDURE IF EXISTS remove_promotion_from_service(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_promotion_services(INTEGER) CASCADE;
-- =============================================
-- BOOKING & PAYMENT DROPS
-- =============================================
-- Note: process_payment drop is handled in the refined section below
-- (Removing redundant section 14)
-- =============================================
-- 15. BOOKING & PAYMENT DROPS (REFINED)
-- =============================================
DROP FUNCTION IF EXISTS create_package_returning_id(
    VARCHAR,
    TEXT,
    VARCHAR,
    INTEGER,
    INTEGER,
    DECIMAL,
    INTEGER
) CASCADE;
DROP PROCEDURE IF EXISTS add_passenger_to_booking(INTEGER, VARCHAR, VARCHAR, VARCHAR, DATE) CASCADE;
DROP PROCEDURE IF EXISTS process_payment(
    INTEGER,
    -- p_user_id
    INTEGER,
    -- p_package_id
    DECIMAL,
    -- p_amount
    VARCHAR,
    -- p_method_type
    VARCHAR,
    -- p_description
    VARCHAR,
    -- p_card_number
    VARCHAR,
    -- p_card_holder
    DATE,
    -- p_expiry
    VARCHAR,
    -- p_cvv
    VARCHAR,
    -- p_card_type
    VARCHAR,
    -- p_card_bank
    VARCHAR,
    -- p_check_number
    VARCHAR,
    -- p_check_holder
    VARCHAR,
    -- p_check_bank
    DATE,
    -- p_check_issue_date
    VARCHAR,
    -- p_check_account
    VARCHAR,
    -- p_dep_number
    VARCHAR,
    -- p_dep_bank
    DATE,
    -- p_dep_date
    VARCHAR,
    -- p_dep_ref
    VARCHAR,
    -- p_transfer_number
    TIMESTAMP,
    -- p_transfer_time
    VARCHAR,
    -- p_pm_ref
    TIMESTAMP,
    -- p_pm_time
    VARCHAR,
    -- p_usdt_wallet
    DATE,
    -- p_usdt_date
    TIMESTAMP,
    -- p_usdt_time
    VARCHAR,
    -- p_zelle_conf
    DATE,
    -- p_zelle_date
    TIMESTAMP,
    -- p_zelle_time
    INTEGER,
    -- p_miles
    VARCHAR,
    -- p_zelle_email
    VARCHAR,
    -- p_zelle_phone
    VARCHAR,
    -- p_cedula
    VARCHAR,
    -- p_phone
    VARCHAR,
    -- p_usdt_id
    INTEGER -- p_plan_id (ADDED)
) CASCADE;
DROP FUNCTION IF EXISTS calculate_package_price CASCADE;
DROP FUNCTION IF EXISTS get_package_payment_info CASCADE;
DROP FUNCTION IF EXISTS get_booking_passengers(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_package_total_price(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_bookings(INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS toggle_wishlist(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS is_in_wishlist(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_user_wishlist(INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS upsert_tag(
    INTEGER,
    VARCHAR,
    VARCHAR,
    VARCHAR,
    VARCHAR,
    BOOLEAN
) CASCADE;
DROP PROCEDURE IF EXISTS assign_tag_to_package(INTEGER, INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS remove_all_tags_from_package(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_all_tags() CASCADE;
DROP FUNCTION IF EXISTS get_package_tags(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS evaluate_tag_condition(INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS check_package_restrictions(INTEGER, INTEGER) CASCADE;
-- =============================================
-- 16. NEW PACKAGE AND SERVICE REVIEW DROPS
-- =============================================
DROP FUNCTION IF EXISTS get_all_packages_with_ratings() CASCADE;
DROP FUNCTION IF EXISTS get_package_services_with_ratings(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_package_reviews(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_service_reviews(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_package_hotels_with_ratings(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_hotel_reviews(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS cancel_package_with_refund(INTEGER, INTEGER) CASCADE;
DROP PROCEDURE IF EXISTS submit_review(
    TEXT,
    INTEGER,
    INTEGER,
    INTEGER,
    INTEGER,
    INTEGER,
    INTEGER
) CASCADE;
DROP PROCEDURE IF EXISTS submit_complaint(
    TEXT,
    INTEGER,
    INTEGER,
    INTEGER,
    INTEGER
) CASCADE;
DROP FUNCTION IF EXISTS get_user_complaints(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_all_characteristics() CASCADE;
-- =============================================
-- 17. ELIMINAR ROLES DE LA APLICACIÓN
-- =============================================
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_administrador'
) THEN EXECUTE 'DROP OWNED BY app_administrador';
END IF;
END $$;
DROP ROLE IF EXISTS app_administrador;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_cliente'
) THEN EXECUTE 'DROP OWNED BY app_cliente';
END IF;
END $$;
DROP ROLE IF EXISTS app_cliente;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_proveedor'
) THEN EXECUTE 'DROP OWNED BY app_proveedor';
END IF;
END $$;
DROP ROLE IF EXISTS app_proveedor;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_auditor'
) THEN EXECUTE 'DROP OWNED BY app_auditor';
END IF;
END $$;
DROP ROLE IF EXISTS app_auditor;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_agente'
) THEN EXECUTE 'DROP OWNED BY app_agente';
END IF;
END $$;
DROP ROLE IF EXISTS app_agente;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_analista'
) THEN EXECUTE 'DROP OWNED BY app_analista';
END IF;
END $$;
DROP ROLE IF EXISTS app_analista;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_gerente'
) THEN EXECUTE 'DROP OWNED BY app_gerente';
END IF;
END $$;
DROP ROLE IF EXISTS app_gerente;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_operador'
) THEN EXECUTE 'DROP OWNED BY app_operador';
END IF;
END $$;
DROP ROLE IF EXISTS app_operador;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_soporte'
) THEN EXECUTE 'DROP OWNED BY app_soporte';
END IF;
END $$;
DROP ROLE IF EXISTS app_soporte;
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'app_ventas'
) THEN EXECUTE 'DROP OWNED BY app_ventas';
END IF;
END $$;
DROP ROLE IF EXISTS app_ventas;