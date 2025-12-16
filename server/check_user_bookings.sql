SELECT 
    u.cod AS user_id,
    u.primer_nombre_usu || ' ' || u.primer_apellido_usu AS user_name,
    u.email_usu AS user_email,
    p.cod AS package_id,
    p.nombre_paq AS package_name,
    p.estado_paq AS package_status,
    pay.fecha_pago AS payment_date,
    pay.monto_pago AS amount_paid
FROM 
    usuario u
JOIN 
    paquete_turistico p ON u.cod = p.fk_cod_usuario
LEFT JOIN 
    pago pay ON p.cod = pay.fk_cod_paquete
ORDER BY 
    u.cod DESC, p.cod DESC;
