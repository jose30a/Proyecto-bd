-- Remove ALL versions of upsert_promotion and create only the correct one
DROP PROCEDURE IF EXISTS upsert_promotion(INTEGER, VARCHAR, DECIMAL) CASCADE;
DROP PROCEDURE IF EXISTS upsert_promotion(TEXT, TEXT, TEXT) CASCADE;
DROP PROCEDURE IF EXISTS upsert_promotion(INTEGER, TEXT, DECIMAL) CASCADE;
DROP PROCEDURE IF EXISTS upsert_promotion CASCADE;

-- Create the correct version that accepts TEXT
CREATE OR REPLACE PROCEDURE upsert_promotion(
    p_id TEXT,
    p_tipo TEXT,
    p_discount TEXT
) AS $$
DECLARE
    v_id INTEGER;
    v_discount DECIMAL;
BEGIN
    -- Convert TEXT to INTEGER for ID (handle NULL)
    IF p_id IS NULL OR p_id = '' OR p_id = 'null' THEN
        v_id := NULL;
    ELSE
        v_id := p_id::INTEGER;
    END IF;
    
    -- Convert TEXT to DECIMAL for discount
    v_discount := p_discount::DECIMAL;
    
    IF v_id IS NULL THEN
        -- Insert new promotion
        INSERT INTO promocion (
            tipo_pro,
            porcen_descuento
        )
        VALUES (
            p_tipo,
            v_discount
        );
    ELSE
        -- Update existing promotion
        UPDATE promocion
        SET 
            tipo_pro = p_tipo,
            porcen_descuento = v_discount
        WHERE cod = v_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
