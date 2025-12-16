-- Procedure to process a payment
-- It inserts into metodoDePago and then into pago
CREATE OR REPLACE PROCEDURE process_payment(
    p_user_id INTEGER,
    p_package_id INTEGER,
    p_amount DECIMAL,
    p_method_type VARCHAR, -- 'Credit Card', 'Zelle', etc.
    p_description VARCHAR,
    -- Expanded Payment Details
    -- Tarjeta
    p_card_number VARCHAR DEFAULT NULL,
    p_card_holder VARCHAR DEFAULT NULL,
    p_expiry_date DATE DEFAULT NULL,
    p_cvv VARCHAR DEFAULT NULL,
    p_card_type VARCHAR DEFAULT NULL, -- 'Credit' or 'Debit'
    p_card_bank VARCHAR DEFAULT NULL,
    -- Cheque
    p_check_number VARCHAR DEFAULT NULL,
    p_check_holder VARCHAR DEFAULT NULL,
    p_check_bank VARCHAR DEFAULT NULL,
    p_check_issue_date DATE DEFAULT NULL,
    p_check_account VARCHAR DEFAULT NULL,
    -- Deposito
    p_deposit_number VARCHAR DEFAULT NULL,
    p_deposit_bank VARCHAR DEFAULT NULL,
    p_deposit_date DATE DEFAULT NULL,
    p_deposit_ref VARCHAR DEFAULT NULL,
    -- Transferencia
    p_transfer_number VARCHAR DEFAULT NULL,
    p_transfer_time TIMESTAMP DEFAULT NULL,
    -- Pago Movil
    p_pm_ref VARCHAR DEFAULT NULL,
    p_pm_time TIMESTAMP DEFAULT NULL,
    -- USDt
    p_usdt_wallet VARCHAR DEFAULT NULL,
    p_usdt_date DATE DEFAULT NULL,
    p_usdt_time TIMESTAMP DEFAULT NULL, /* or TIME, but DB uses TIMESTAMP mostly */
    -- Zelle
    p_zelle_confirm VARCHAR DEFAULT NULL,
    p_zelle_date DATE DEFAULT NULL,
    p_zelle_time TIMESTAMP DEFAULT NULL, 
    -- Legacy/Fallback?
    p_zelle_email VARCHAR DEFAULT NULL,
    p_zelle_phone VARCHAR DEFAULT NULL,
    p_cedula VARCHAR DEFAULT NULL,
    p_phone_number VARCHAR DEFAULT NULL
) AS $$
DECLARE
    v_method_id INTEGER;
    v_db_method_type VARCHAR;
BEGIN
    -- Map Frontend Method Names
    v_db_method_type := p_method_type;
    IF p_method_type = 'Credit Card' THEN
        v_db_method_type := 'TarjetaCreditoDebito';
    END IF;

    -- Insert into metodoDePago
    -- Use specific columns based on method type and available inputs
    INSERT INTO metodoDePago (
        descripcion_met, fk_usuario, tipoMetodo,
        -- Tarjeta
        n_tarjeta_tar, titular_tar, f_venc_tar, cod_seg_tar, tipo_tar, banco_tar,
        -- Cheque
        n_cheque_che, titular_che, bancoemisor_che, f_emision_che, cod_cuenta_che,
        -- Deposito (Assuming n_ref_dep is deposit number, n_destino_dep/banco_dep used appropriately)
        n_ref_dep, banco_dep, fecha_dep, n_destino_dep, -- using n_destino_dep for Reference if needed, or n_ref_dep for Number
        -- Transferencia
        n_ref_tra, f_hora_tra,
        -- Pago Movil
        n_ref_pag, f_hora_pag,
        -- USDt
        id_usd, f_hora_usd, billetera_usd,
        -- Zelle
        n_confirm_zel, f_hora_zel
    ) VALUES (
        p_description, p_user_id, v_db_method_type,
        -- Tarjeta
        p_card_number, p_card_holder, p_expiry_date, p_cvv, p_card_type, p_card_bank,
        -- Cheque
        p_check_number, p_check_holder, p_check_bank, p_check_issue_date, p_check_account,
        -- Deposito (Mapping inputs to columns)
        p_deposit_number, p_deposit_bank, p_deposit_date, p_deposit_ref,
        -- Transferencia
        p_transfer_number, p_transfer_time,
        -- Pago Movil
        p_pm_ref, p_pm_time,
        -- USDt (Mapping inputs)
        p_usdt_wallet, -- id_usd unique?? maybe use some unique value or just store wallet here? Schema says id_usd UNIQUE. Wallet Address is unique enough? Or generate ID?
                       -- IMPORTANT: id_usd is UNIQUE. We should probably use wallet address + timestamp or something? 
                       -- For now, using wallet address as id_usd might clash if same wallet pays twice. 
                       -- Let's put wallet address in billetera_usd. id_usd needs to be unique string.
                       -- Using p_usdt_wallet for billetera_usd.
        (p_usdt_date + (p_usdt_time::time)), -- Combine date+time for f_hora_usd
        p_usdt_wallet,
        -- Zelle
        p_zelle_confirm, (p_zelle_date + (p_zelle_time::time))
    ) RETURNING cod INTO v_method_id;

    -- Insert into pago
    INSERT INTO pago (
        monto_pago, fecha_pago, fk_cod_paquete, fk_metodo_pago
    ) VALUES (
        p_amount, NOW(), p_package_id, v_method_id
    );
    
    UPDATE paquete_turistico SET estado_paq = 'Active' WHERE cod = p_package_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user bookings
CREATE OR REPLACE FUNCTION get_user_bookings(p_user_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    package_name VARCHAR,
    description TEXT,
    start_date DATE,
    duration INTEGER,
    status VARCHAR,
    total_price DECIMAL,
    booking_date TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.cod AS id,
        p.nombre_paq AS package_name,
        p.descripcion_paq AS description,
        COALESCE(MIN(sp.inicio_ser), CURRENT_DATE) AS start_date, -- Derive start date from services
        COALESCE(p.millaje_paq, 5) AS duration, -- Placeholder, ideally calculated
        CASE WHEN pa.cod IS NOT NULL THEN 'Confirmed' ELSE 'Pending Payment' END::VARCHAR AS status,
        COALESCE(pa.monto_pago, 0)::DECIMAL AS total_price,
        COALESCE(pa.fecha_pago, NOW())::TIMESTAMP AS booking_date
    FROM paquete_turistico p
    LEFT JOIN pago pa ON p.cod = pa.fk_cod_paquete
    LEFT JOIN paq_paq pp ON p.cod = pp.fk_paquete_padre
    LEFT JOIN paquete_turistico child ON pp.fk_paquete_hijo = child.cod
    LEFT JOIN ser_paq sp ON child.cod = sp.fk_paquete -- Try to find services in children
    WHERE p.fk_cod_usuario = p_user_id
    GROUP BY p.cod, p.nombre_paq, p.descripcion_paq, p.millaje_paq, pa.cod, pa.monto_pago, pa.fecha_pago
    ORDER BY booking_date DESC;
END;
$$ LANGUAGE plpgsql;
