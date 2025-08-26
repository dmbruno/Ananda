import React from 'react';
import './ResumenVenta.css';

export default function ResumenVenta({ 
  items = [], 
  total = 0, 
  descuento = 0, 
  metodoPago = 'efectivo',
  onDescuentoChange,
  onMetodoPagoChange 
}) {
  const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const montoDescuento = (subtotal * descuento) / 100;
  const totalFinal = subtotal - montoDescuento;

  const metodosPago = [
    { value: 'FT', label: '💵 Efectivo', icon: '💵' },
    { value: 'TC', label: '💳 Tarjeta', icon: '💳' },
    { value: 'TB', label: '📱 Transferencia', icon: '📱' }
  ];

  const handleDescuentoChange = (e) => {
    const valor = parseFloat(e.target.value) || 0;
    onDescuentoChange(Math.max(0, Math.min(100, valor)));
  };

  return (
    <div className="resumen-venta">
      <h3 className="resumen-venta-titulo">📋 Resumen de la Venta</h3>
      
      <div className="resumen-venta-contenido">
        {/* Método de pago */}
        <div className="resumen-venta-seccion">
          <label className="resumen-venta-label">Método de Pago</label>
          <div className="resumen-venta-metodos-pago">
            {metodosPago.map(metodo => (
              <button
                key={metodo.value}
                className={`resumen-venta-metodo ${metodoPago === metodo.value ? 'resumen-venta-metodo-activo' : ''}`}
                onClick={() => onMetodoPagoChange(metodo.value)}
              >
                <span className="resumen-venta-metodo-icono">{metodo.icon}</span>
                <span className="resumen-venta-metodo-texto">{metodo.label.replace(metodo.icon + ' ', '')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Descuento */}
        <div className="resumen-venta-seccion">
          <label className="resumen-venta-label">Descuento (%)</label>
          <div className="resumen-venta-descuento-container">
            <input
              type="number"
              className="resumen-venta-descuento-input"
              value={descuento}
              onChange={handleDescuentoChange}
              min="0"
              max="100"
              step="0.1"
              placeholder="0"
            />
            <span className="resumen-venta-descuento-simbolo">%</span>
          </div>
        </div>

        {/* Cálculos */}
        <div className="resumen-venta-calculos">
          <div className="resumen-venta-linea">
            <span className="resumen-venta-concepto">Subtotal ({items.length} productos)</span>
            <span className="resumen-venta-valor">${subtotal.toLocaleString('es-AR')}</span>
          </div>
          
          {descuento > 0 && (
            <div className="resumen-venta-linea resumen-venta-descuento">
              <span className="resumen-venta-concepto">Descuento ({descuento}%)</span>
              <span className="resumen-venta-valor">-${montoDescuento.toLocaleString('es-AR')}</span>
            </div>
          )}
          
          <div className="resumen-venta-linea resumen-venta-total">
            <span className="resumen-venta-concepto">Total a Pagar</span>
            <span className="resumen-venta-valor">${totalFinal.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
