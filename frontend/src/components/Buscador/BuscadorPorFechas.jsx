import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // Importar useSelector para acceder al estado de Redux
import './BuscadorPorFechas.css';
import notify from '../../utils/notify';



const BuscadorPorFechas = ({
  desde,
  hasta,
  onChangeDesde,
  onChangeHasta,
  onBuscar,
  onDescargarCSV,
  mostrarDescarga = false,
  labelDesde = 'Desde',
  labelHasta = 'Hasta',
  loading = false,
  compactMode = false,
  ...props
}) => {
  // Obtener información del usuario desde Redux
  const user = useSelector(state => state.auth.user);
  const isAdmin = user && user.is_admin === true;

  const [localDesde, setLocalDesde] = useState(desde || '');
  const [localHasta, setLocalHasta] = useState(hasta || '');
  const [modoDescarga, setModoDescarga] = useState(false);
  // Eliminado estado local de notificaciones; usamos notify global

  // Sincronizar estados locales con props cuando cambien desde el componente padre
  useEffect(() => {
    setLocalDesde(desde || '');
  }, [desde]);

  useEffect(() => {
    setLocalHasta(hasta || '');
  }, [hasta]);

  // Cuando cambia el rango, salir de modo descarga
  const handleChangeDesde = (val) => {
    setLocalDesde(val);
    setModoDescarga(false);
    if (onChangeDesde) onChangeDesde(val);
  };
  const handleChangeHasta = (val) => {
    setLocalHasta(val);
    setModoDescarga(false);
    if (onChangeHasta) onChangeHasta(val);
  };

  const handleBuscar = () => {
    
    if (onBuscar) onBuscar(localDesde, localHasta);
    // Pasar a modo descarga inmediatamente si hay fechas válidas
    if (localDesde && localHasta) {
      setModoDescarga(true);
      
    } else {
      
    }
  };

  const handleDescargar = () => {
    // Verificar si el usuario es administrador
    if (!isAdmin) {
      notify.warn('Solo los administradores pueden descargar reportes.');
      return;
    }

    if (onDescargarCSV) onDescargarCSV(localDesde, localHasta);
    notify.success('El reporte fue enviado para descarga');
    setLocalDesde("");
    setLocalHasta("");
    setModoDescarga(false);
    if (onChangeDesde) onChangeDesde("");
    if (onChangeHasta) onChangeHasta("");
  };

  return (
    <div className="buscador-fechas-container">
      {/* Las notificaciones ahora se muestran con react-toastify (notify) */}

      <div className={`buscador-fechas-bar ${props.className || ''}`}>
        <label className="buscador-fechas-label">{labelDesde}: </label>
        <input
          type="date"
          className="buscador-fechas-input"
          value={localDesde}
          onChange={e => handleChangeDesde(e.target.value)}
        />
        <label className="buscador-fechas-label">{labelHasta}: </label>
        <input
          type="date"
          className="buscador-fechas-input"
          value={localHasta}
          onChange={e => handleChangeHasta(e.target.value)}
        />
        <div className="buscador-fechas-actions">
          {!modoDescarga && (
            <button className="buscador-fechas-buscar" onClick={handleBuscar} disabled={loading} title="Buscar">
              <span role="img" aria-label="Buscar">🔍</span>
            </button>
          )}
          {modoDescarga && mostrarDescarga && (
            <button 
              className={`buscador-fechas-csv ${!isAdmin ? 'btn-disabled' : ''}`} 
              onClick={handleDescargar} 
              title={isAdmin ? "Descargar CSV" : "Solo disponible para administradores"}
            >
              <span role="img" aria-label="Descargar">📥</span> .CSV
              {!isAdmin && <span className="admin-only-icon">🔒</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuscadorPorFechas;
