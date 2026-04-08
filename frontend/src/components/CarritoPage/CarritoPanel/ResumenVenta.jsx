import './ResumenVenta.css';

export default function ResumenVenta({
  items = [],
  descuento = { tipo: 'porcentaje', valor: 0 },
  metodoPago = 'efectivo',
  onDescuentoChange,
  onTipoDescuentoChange,
  onMetodoPagoChange
}) {
  const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  let montoDescuento = 0;
  if (descuento.tipo === 'porcentaje') {
    montoDescuento = (subtotal * descuento.valor) / 100;
  } else {
    montoDescuento = Math.min(descuento.valor, subtotal);
  }

  const totalFinal = subtotal - montoDescuento;

  const metodosPago = [
    { value: 'FT', label: '💵 Efectivo', icon: '💵' },
    { value: 'TC', label: '💳 Tarjeta', icon: '💳' },
    { value: 'TB', label: '📱 Transferencia', icon: '📱' }
  ];

  const handleDescuentoChange = (e) => {
    const valor = parseFloat(e.target.value) || 0;
    if (descuento.tipo === 'porcentaje') {
      onDescuentoChange({ tipo: 'porcentaje', valor: Math.max(0, Math.min(100, valor)) });
    } else {
      onDescuentoChange({ tipo: 'monto', valor: Math.max(0, Math.min(subtotal, valor)) });
    }
  };

  const handleTipoDescuentoChange = (tipo) => {
    onTipoDescuentoChange(tipo);
  };

  const getDescuentoLabel = () => {
    if (descuento.tipo === 'porcentaje') {
      return `Descuento (${descuento.valor}%)`;
    } else {
      return `Descuento ($${descuento.valor.toLocaleString('es-AR')})`;
    }
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

        {/* Descuento - Selector de tipo */}
        <div className="resumen-venta-seccion">
          <label className="resumen-venta-label">Tipo de Descuento</label>
          <div className="resumen-venta-tipo-descuento">
            <button
              className={`resumen-venta-tipo-btn ${descuento.tipo === 'porcentaje' ? 'resumen-venta-tipo-btn-activo' : ''}`}
              onClick={() => handleTipoDescuentoChange('porcentaje')}
            >
              %
            </button>
            <button
              className={`resumen-venta-tipo-btn ${descuento.tipo === 'monto' ? 'resumen-venta-tipo-btn-activo' : ''}`}
              onClick={() => handleTipoDescuentoChange('monto')}
            >
              $
            </button>
          </div>
        </div>

        {/* Descuento - Input valor */}
        <div className="resumen-venta-seccion">
          <label className="resumen-venta-label">{getDescuentoLabel()}</label>
          <div className="resumen-venta-descuento-container">
            <input
              type="number"
              className="resumen-venta-descuento-input"
              value={descuento.valor}
              onChange={handleDescuentoChange}
              min="0"
              max={descuento.tipo === 'porcentaje' ? 100 : subtotal}
              step={descuento.tipo === 'porcentaje' ? 0.1 : 1}
              placeholder="0"
            />
            <span className="resumen-venta-descuento-simbolo">
              {descuento.tipo === 'porcentaje' ? '%' : '$'}
            </span>
          </div>
        </div>

        {/* Cálculos */}
        <div className="resumen-venta-calculos">
          <div className="resumen-venta-linea">
            <span className="resumen-venta-concepto">Subtotal ({items.length} productos)</span>
            <span className="resumen-venta-valor">${subtotal.toLocaleString('es-AR')}</span>
          </div>

          {montoDescuento > 0 && (
            <div className="resumen-venta-linea resumen-venta-descuento">
              <span className="resumen-venta-concepto">
                {descuento.tipo === 'porcentaje'
                  ? `Descuento (${descuento.valor}%)`
                  : `Descuento ($${descuento.valor.toLocaleString('es-AR')})`}
              </span>
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
