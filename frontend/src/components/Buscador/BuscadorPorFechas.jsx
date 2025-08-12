import React, { useState } from 'react';
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
    if (mostrarDescarga) setModoDescarga(true);
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
