-- Add overload for upsert_promotion(INTEGER, TEXT, INTEGER)
-- This is needed for editing existing promotions where ID is sent as INTEGER

CREATE OR REPLACE PROCEDURE upsert_promotion(
    p_id INTEGER,
    p_tipo TEXT,
    p_discount INTEGER
) AS $$
BEGIN
    IF p_id IS NULL THEN
        -- Insert new promotion (should unlikely be hit here if id is INTEGER, but safe to keep)
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
        WHERE cod = p_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
