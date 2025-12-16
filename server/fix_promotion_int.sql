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
DECLARE
    v_id INTEGER;
BEGIN
    -- Convert TEXT to INTEGER for ID (handle NULL)
    IF p_id IS NULL OR p_id = '' OR p_id = 'null' THEN
        v_id := NULL;
    ELSE
        v_id := p_id::INTEGER;
    END IF;
    
    -- p_discount is already INTEGER, usable for DECIMAL column usually implies implicit cast or explicit cast
    
    IF v_id IS NULL THEN
        -- Insert new promotion
        INSERT INTO promocion (
            tipo_pro,
            porcen_descuento
        )
        VALUES (
            p_tipo,
            p_discount::DECIMAL
        );
    ELSE
        -- Update existing promotion
        UPDATE promocion
        SET 
            tipo_pro = p_tipo,
            porcen_descuento = p_discount::DECIMAL
        WHERE cod = v_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
