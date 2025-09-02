import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { abrirCaja, obtenerCajaActual, limpiarError } from '../../../store/cajaSlice';
import './AbrirCajaModal.css';

const AbrirCajaModal = ({ onCajaAbierta }) => {
  const dispatch = useDispatch();
  const { loading, error, cajaActual, estado } = useSelector(state => state.caja);
  const [montoInicial, setMontoInicial] = useState('');
  const [localError, setLocalError] = useState('');
  const [intentosVerificar, setIntentosVerificar] = useState(0);
  const cajaVerificada = useRef(false);
  const MAX_INTENTOS = 3; // Máximo número de intentos para verificar la caja
  const [opening, setOpening] = useState(false);

  // Limpiar errores anteriores al montar el componente
  useEffect(() => {
    dispatch(limpiarError());
  }, [dispatch]);
  
  // Verificar si ya hay una caja abierta al cargar el componente
  // Solo ejecutar una vez para evitar bucles infinitos
  useEffect(() => {
    if (!cajaVerificada.current && intentosVerificar < MAX_INTENTOS) {
      console.log(`🔍 VentasPage Modal: Verificando estado de caja inicial... (intento ${intentosVerificar + 1}/${MAX_INTENTOS})`);
      dispatch(obtenerCajaActual());
      cajaVerificada.current = true;
    }
  }, [dispatch]);

  // Si ya hay una caja abierta, notificar al padre
  useEffect(() => {
    if (estado === 'abierta' && cajaActual && onCajaAbierta) {
      console.log('🟢 VentasPage Modal: Detectada caja ya abierta, redirigiendo:', cajaActual);
      onCajaAbierta();
    }
  }, [estado, cajaActual, onCajaAbierta]);

  // Manejar errores en el estado de la caja
  useEffect(() => {
    if (error && error.includes('Usuario no autenticado')) {
      setLocalError('Error de autenticación. Intente iniciar sesión nuevamente.');
      console.log('🔴 VentasPage Modal: Error de autenticación detectado, redirigiendo a login...');
    }
  }, [error]);

  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    
    try {
      // Si ya hay una caja abierta, simplemente notificar al padre
      if (estado === 'abierta' && cajaActual && onCajaAbierta) {
        console.log('🟢 VentasPage Modal: Utilizando caja ya abierta:', cajaActual);
        onCajaAbierta();
        return;
      }
      
      setLocalError(''); // Limpiar error local
      const monto = parseFloat(montoInicial) || 0;
      
      console.log('🔍 VentasPage Modal: Intentando abrir caja con monto:', monto, typeof monto);
      setOpening(true);
      const resultado = await dispatch(abrirCaja(monto)).unwrap();
      console.log('✅ VentasPage Modal: Caja abierta con éxito:', resultado);
      
      // Llamar a la función de callback después de abrir la caja exitosamente
      if (onCajaAbierta) {
        console.log('✅ VentasPage Modal: Llamando al callback onCajaAbierta');
        onCajaAbierta();
      }
    } catch (error) {
      console.error('❌ VentasPage Modal: Error al abrir caja:', error);
      
      // Si el error es que ya existe una caja abierta, intentar usarla
      if (error?.error?.includes('Ya hay una caja abierta') && error?.caja) {
        console.log('🟠 VentasPage Modal: Ya existe una caja abierta, intentando usarla:', error.caja);
        
        // Simplemente usar la caja que ya tenemos en el error
        if (onCajaAbierta) {
          onCajaAbierta();
        }
        return;
      }
      
      // Mostrar mensaje de error específico
      if (error && typeof error === 'object') {
        if (error.error) {
          setLocalError(`Error: ${error.error}`);
        } else if (error.message) {
          setLocalError(`Error: ${error.message}`);
        } else if (error.traceback) {
          setLocalError(`Error interno del servidor. Contacta al administrador.`);
          console.error('❌ VentasPage Modal: Traceback:', error.traceback);
        }
      } else {
        setLocalError('Error desconocido al abrir la caja');
      }
    } finally {
      setOpening(false);
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
              disabled={opening}
              className="abrir-caja-modal-btn-primary"
            >
              {opening ? '⏳ Abriendo...' : '💰 Abrir Caja'}
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