
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
