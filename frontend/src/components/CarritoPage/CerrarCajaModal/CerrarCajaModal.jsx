import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { cerrarCaja } from '../../../store/cajaSlice';
import './CerrarCajaModal.css';

const CerrarCajaModal = ({ cajaActual: cajaProp, onCajaCerrada, onCancel }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.caja);
  const [montoDeclarado, setMontoDeclarado] = useState('');
  const [montoSistema, setMontoSistema] = useState(0);
  const [diferencia, setDiferencia] = useState(0);
  const [notas, setNotas] = useState('');
  
  // Usar la caja que viene como prop si está disponible
  const cajaDatos = cajaProp || useSelector(state => state.caja.cajaActual);

  useEffect(() => {
    // Calcular monto del sistema al cargar
    if (cajaDatos) {
      
      
      // Obtener las ventas asociadas a esta caja
      let totalVentas = 0;
      let ventas = [];
      
      if (cajaDatos.ventas && Array.isArray(cajaDatos.ventas)) {
        ventas = cajaDatos.ventas;
        
        
        // Verificar cada venta para asegurarnos que son válidas
        ventas.forEach((venta, index) => {
          
          if (venta && typeof venta.total === 'number') {
            totalVentas += venta.total;
          } else {
            console.warn(`DEBUG - Venta ${index} tiene datos incompletos:`, venta);
          }
        });
        
        
      } else if (cajaDatos.ventas_total) {
        totalVentas = cajaDatos.ventas_total;
        
      } else {
        // Si no tenemos ventas ni total de ventas, pero tenemos monto_final y monto_inicial
        // podemos calcular el total de ventas como la diferencia entre ambos
        if (cajaDatos.monto_final !== null && cajaDatos.monto_inicial !== null) {
          totalVentas = cajaDatos.monto_final - cajaDatos.monto_inicial;
          
        } else {
          
        }
      }
      
      
      const montoSistemaCaja = parseFloat(cajaDatos.monto_inicial || 0) + totalVentas;
      
      
      setMontoSistema(montoSistemaCaja);
      setMontoDeclarado(montoSistemaCaja.toString()); // Predefinir con el monto del sistema
      
      // Si no hay ventas pero hay monto_final, actualizar totalVentas para mostrar correctamente en el UI
      if (ventas.length === 0 && totalVentas > 0) {
        
      }
    } else {
      console.error('No se recibió información de la caja para cerrar');
    }
  }, [cajaDatos]);
  
  // Calcular diferencia cuando cambia el monto declarado
  useEffect(() => {
    const montoDeclaradoNum = parseFloat(montoDeclarado) || 0;
    setDiferencia(montoDeclaradoNum - montoSistema);
  }, [montoDeclarado, montoSistema]);

  const handleCerrarCaja = async (e) => {
    e.preventDefault();
    
    try {
      
      
      await dispatch(cerrarCaja({
        notas,
        monto_declarado: parseFloat(montoDeclarado)
      })).unwrap();
      
      alert('Caja cerrada exitosamente');
      onCajaCerrada();
    } catch (error) {
      console.error('Error al cerrar caja:', error);
      alert('Error al cerrar caja: ' + (error.message || 'Error desconocido'));
    }
  };
  
  const handleCancelar = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Si no hay caja, no mostrar el modal
  if (!cajaDatos) return null;
  
  // Calcular total de ventas
  let totalVentas = 0;
  let cantidadVentas = 0;
  let ventasList = [];
  
  
  
  if (cajaDatos.ventas && Array.isArray(cajaDatos.ventas) && cajaDatos.ventas.length > 0) {
    
    ventasList = cajaDatos.ventas;
    totalVentas = cajaDatos.ventas.reduce((sum, venta) => {
      const ventaTotal = venta && typeof venta.total === 'number' ? venta.total : 0;
      return sum + ventaTotal;
    }, 0);
    cantidadVentas = cajaDatos.ventas.length;
    
  } else {
    
    totalVentas = cajaDatos.ventas_total || 0;
    cantidadVentas = cajaDatos.ventas_cantidad || 0;
    
    
    // Intentar calcular la diferencia si no hay ventas
    if (cajaDatos.monto_final && cajaDatos.monto_inicial) {
      const calculoAlternativo = cajaDatos.monto_final - cajaDatos.monto_inicial;
      
    }
  }
  
  
  
 
  
  // Determinar el tipo de diferencia para el estilo
  const diferenciaType = diferencia === 0 ? 'igual' : (diferencia > 0 ? 'positiva' : 'negativa');

  return (
    <div className="cerrar-caja-modal-overlay">
      <div className="cerrar-caja-modal">
        <div className="cerrar-caja-modal-header">
          <h2>🔒 Cerrar Caja</h2>
          <p>Cierre la caja para finalizar las operaciones del día</p>
        </div>

        <div className="cerrar-caja-modal-resumen">
          <div className="resumen-item">
            <span className="resumen-label">Monto Inicial:</span>
            <span className="resumen-valor">${parseFloat(cajaDatos.monto_inicial || 0).toLocaleString('es-AR')}</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Ventas Realizadas:</span>
            <span className="resumen-valor">{cantidadVentas} {cantidadVentas === 0 && '⚠️'}</span>
          </div>
          <div className="resumen-item">
            <span className="resumen-label">Total Ventas:</span>
            <span className="resumen-valor">${totalVentas.toLocaleString('es-AR')}</span>
          </div>
          <div className="resumen-item total">
            <span className="resumen-label">Monto en Sistema:</span>
            <span className="resumen-valor">${montoSistema.toLocaleString('es-AR')}</span>
          </div>
          
          {/* Si hay ventas, mostrar el detalle */}
          {(ventasList && ventasList.length > 0) ? (
            <div className="ventas-detalle">
              <h3>Ventas del día ({ventasList.length})</h3>
              <table className="ventas-tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Método</th>
                    <th>Total</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasList.map(venta => (
                    <tr key={venta.id}>
                      <td>{venta.id}</td>
                      <td>{venta.cliente_nombre || (venta.cliente && venta.cliente.nombre) || 'Cliente #' + venta.cliente_id}</td>
                      <td>{venta.metodo_pago}</td>
                      <td>${venta.total ? venta.total.toLocaleString('es-AR') : '0'}</td>
                      <td>{new Date(venta.fecha_venta || venta.fecha).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="ventas-detalle-vacia">
              <h3>No hay ventas registradas</h3>
              <p>Esta caja no tiene ventas asociadas o no se pudieron cargar los datos.</p>
              <p>Cantidad reportada: {cantidadVentas}</p>
              <p>Total reportado: ${totalVentas.toLocaleString('es-AR')}</p>
            </div>
          )}
        </div>

        <form onSubmit={handleCerrarCaja} className="cerrar-caja-modal-form">
          <div className="cerrar-caja-modal-field">
            <label htmlFor="montoDeclarado">Monto declarado</label>
            <div className="cerrar-caja-modal-input-group">
              <span className="cerrar-caja-modal-currency">$</span>
              <input
                id="montoDeclarado"
                type="number"
                min="0"
                step="0.01"
                value={montoDeclarado}
                onChange={(e) => setMontoDeclarado(e.target.value)}
                placeholder="0.00"
                className="cerrar-caja-modal-input"
              />
            </div>
            <small className="cerrar-caja-modal-help">
              Ingresa el dinero total contado en la caja
            </small>
          </div>

          <div className={`diferencia-caja ${diferenciaType}`}>
            <span className="diferencia-label">Diferencia:</span>
            <span className="diferencia-valor">
              {diferencia === 0 ? '$0.00' : 
               diferencia > 0 ? `+$${diferencia.toFixed(2)}` : 
               `-$${Math.abs(diferencia).toFixed(2)}`}
            </span>
          </div>

          <div className="cerrar-caja-modal-field">
            <label htmlFor="notas">Notas (opcional)</label>
            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Agregue observaciones sobre el cierre"
              className="cerrar-caja-modal-textarea"
            ></textarea>
          </div>

          {error && (
            <div className="cerrar-caja-modal-error">
              ⚠️ {error}
            </div>
          )}

          <div className="cerrar-caja-modal-actions">
            <button
              type="button"
              onClick={handleCancelar}
              className="cerrar-caja-modal-btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="cerrar-caja-modal-btn-primary"
            >
              {loading ? '⏳ Cerrando...' : '🔒 Cerrar Caja'}
            </button>
          </div>
        </form>

        <div className="cerrar-caja-modal-info">
          <h3>ℹ️ Información</h3>
          <ul>
            <li>Una vez cerrada la caja, no podrá registrar más ventas</li>
            <li>Si hay diferencia, asegúrese de registrar la observación en las notas</li>
            <li>El control administrativo de la caja se realizará posteriormente</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CerrarCajaModal;
