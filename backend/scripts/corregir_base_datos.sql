-- Script para corregir problemas en la base de datos
-- Asegurarse de que todas las cajas tengan un estado válido
UPDATE cajas 
SET estado = 'abierta' 
WHERE fecha_cierre IS NULL AND (estado IS NULL OR estado != 'abierta');

UPDATE cajas 
SET estado = 'cerrada' 
WHERE fecha_cierre IS NOT NULL AND fecha_control IS NULL AND (estado IS NULL OR estado != 'cerrada');

UPDATE cajas 
SET estado = 'controlada' 
WHERE fecha_control IS NOT NULL AND (estado IS NULL OR estado != 'controlada');

-- Asegurarse de que las columnas monto_sistema y diferencia existan y tengan valores correctos
UPDATE cajas 
SET monto_sistema = monto_inicial + (
    SELECT IFNULL(SUM(ventas.total), 0) 
    FROM ventas 
    WHERE ventas.caja_id = cajas.id
)
WHERE monto_sistema IS NULL AND fecha_cierre IS NOT NULL;

UPDATE cajas
SET diferencia = monto_final - monto_sistema
WHERE diferencia IS NULL AND monto_final IS NOT NULL AND monto_sistema IS NOT NULL;
