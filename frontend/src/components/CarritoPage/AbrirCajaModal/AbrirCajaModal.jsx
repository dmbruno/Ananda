import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { abrirCaja } from '../../../store/cajaSlice';
import './AbrirCajaModal.css';

const AbrirCajaModal = ({ onCajaAbierta }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.caja);
  const [montoInicial, setMontoInicial] = useState('');
  const [localError, setLocalError] = useState('');

  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    
    try {
      setLocalError(''); // Limpiar error local
      const monto = parseFloat(montoInicial) || 0;
      
      console.log('🔍 Intentando abrir caja con monto:', monto, typeof monto);
      
      const resultado = await dispatch(abrirCaja(monto)).unwrap();
      console.log('✅ Caja abierta con éxito:', resultado);
      
      // Llamar a la función de callback después de abrir la caja exitosamente
      if (onCajaAbierta) {
        console.log('✅ Llamando al callback onCajaAbierta');
        onCajaAbierta();
      }
    } catch (error) {
      console.error('❌ Error al abrir caja:', error);
      
      // Mostrar mensaje de error específico
      if (error && typeof error === 'object') {
        if (error.error) {
          setLocalError(`Error: ${error.error}`);
        } else if (error.message) {
          setLocalError(`Error: ${error.message}`);
        } else if (error.traceback) {
          setLocalError(`Error interno del servidor. Contacta al administrador.`);
          console.error('❌ Traceback:', error.traceback);
        }
      } else {
        setLocalError('Error desconocido al abrir la caja');
      }
    }
  };

  return (
    <div className="abrir-caja-modal-overlay">
      <div className="abrir-caja-modal">
        <div className="abrir-caja-modal-header">
          <h2>🏪 Abrir Caja</h2>
          <p>Para comenzar a vender, primero debes abrir la caja del día</p>
        </div>

        <form onSubmit={handleAbrirCaja} className="abrir-caja-modal-form">
          <div className="abrir-caja-modal-field">
            <label htmlFor="montoInicial">Monto inicial (opcional)</label>
            <div className="abrir-caja-modal-input-group">
              <span className="abrir-caja-modal-currency">$</span>
              <input
                id="montoInicial"
                type="number"
                min="0"
                step="0.01"
                value={montoInicial}
                onChange={(e) => setMontoInicial(e.target.value)}
                placeholder="0.00"
                className="abrir-caja-modal-input"
              />
            </div>
            <small className="abrir-caja-modal-help">
              Ingresa el dinero inicial en efectivo que hay en la caja
            </small>
          </div>

          {(error || localError) && (
            <div className="abrir-caja-modal-error">
              ⚠️ {localError || error}
            </div>
          )}

          <div className="abrir-caja-modal-actions">
            <button
              type="submit"
              disabled={loading}
              className="abrir-caja-modal-btn-primary"
            >
              {loading ? '⏳ Abriendo...' : '💰 Abrir Caja'}
            </button>
          </div>
        </form>

        <div className="abrir-caja-modal-info">
          <h3>ℹ️ Información</h3>
          <ul>
            <li>Una vez abierta la caja, podrás registrar ventas</li>
            <li>El sistema llevará un control automático de los ingresos</li>
            <li>Al final del día podrás cerrar la caja y generar un reporte</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AbrirCajaModal;
