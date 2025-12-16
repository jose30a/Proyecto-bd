
-- Procedure to add passenger info to a booking (package)
-- Updates ser_paq entries for the given package
DROP PROCEDURE IF EXISTS add_passenger_to_booking(INTEGER, VARCHAR, VARCHAR, VARCHAR, DATE) CASCADE;
CREATE OR REPLACE PROCEDURE add_passenger_to_booking(
    p_booking_id INTEGER,
    p_first_name VARCHAR,
    p_last_name VARCHAR,
    p_passport VARCHAR,
    p_dob DATE
) AS $$
BEGIN
    UPDATE ser_paq
    SET nombre_pasajero = p_first_name,
        apellido_pasajero = p_last_name,
        n_pasaporte_pasajero = p_passport,
        fecha_nacimiento_pasajero = p_dob
    WHERE fk_paquete = p_booking_id;
END;
$$ LANGUAGE plpgsql;
