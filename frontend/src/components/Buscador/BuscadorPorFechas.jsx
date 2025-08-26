import React, { useState, useEffect } from 'react';
import './BuscadorPorFechas.css';



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
  ...props
}) => {

  const [localDesde, setLocalDesde] = useState(desde || '');
  const [localHasta, setLocalHasta] = useState(hasta || '');
  const [modoDescarga, setModoDescarga] = useState(false);

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
    console.log("BuscadorPorFechas - Click en botón buscar con fechas:", { localDesde, localHasta });
    if (onBuscar) onBuscar(localDesde, localHasta);
    // Pasar a modo descarga inmediatamente si hay fechas válidas
    if (localDesde && localHasta) {
      setModoDescarga(true);
      console.log("BuscadorPorFechas - Activando modo descarga");
    } else {
      console.log("BuscadorPorFechas - No se activó modo descarga: faltan fechas");
    }
  };

  const handleDescargar = () => {
    if (onDescargarCSV) onDescargarCSV(localDesde, localHasta);
    window.alert("El reporte fue enviado para descarga");
    setLocalDesde("");
    setLocalHasta("");
    setModoDescarga(false);
    if (onChangeDesde) onChangeDesde("");
    if (onChangeHasta) onChangeHasta("");
  };

  return (
    <div className="buscador-fechas-bar" {...props}>
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
      {!modoDescarga && (
        <button className="buscador-fechas-buscar" onClick={handleBuscar} disabled={loading} title="Buscar">
          <span role="img" aria-label="Buscar">🔍</span>
        </button>
      )}
      {modoDescarga && mostrarDescarga && (
        <button className="buscador-fechas-csv" onClick={handleDescargar} title="Descargar CSV">
          <span role="img" aria-label="Descargar">📥</span> .CSV
        </button>
      )}
    </div>
  );
};

export default BuscadorPorFechas;
