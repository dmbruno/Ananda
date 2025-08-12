import React from "react";
import "./VentasPage.css";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar";
import MetodoDePago from "../components/GraficoMetodoDePago/MetodoDePago";
import GraficoVentas from "../components/GraficoVentas/GraficoVentas";
import BuscadorPorFechas from "../components/Buscador/BuscadorPorFechas";
import TopMasVendidos from "../components/TopMasVendidos/TopMasVendidos";
import "../components/TopMasVendidos/TopMasVendidos.ventas.css";
import UltimosVendidos from "../components/UltimosVendidos/UltimosVendidos";

const VentasPage = () => {
  return (
    <div className="ventas-page-wrapper">
      <div className="ventas-header-bar">
        <h2 className="ventas-header-title">📊 Panel de ventas</h2>
        <HeaderUserBar />
      </div>
      <div className="ventas-grid">
        {/* Espacio 1 */}
        <div className="ventas-grid-item ventas-grafico">
          <GraficoVentas showBuscadorPorFechas={true} />
        </div>
        {/* Espacio 2 */}
        <div className="ventas-grid-item ventas-metodo">
            <MetodoDePago className="metodo-pago-ventas" chartWidth={120} chartHeight={120} showBuscadorPorFechas={true} />
        </div>
        {/* Espacio 3 (abajo izquierda, 0.7fr) */}
        <div className="ventas-grid-item ">
            <UltimosVendidos />
        </div>
        {/* Espacio 4 (abajo derecha, 1.3fr) */}
        <div className="ventas-grid-item ">
            <TopMasVendidos showSmallImage={true} showBuscadorPorFechas={true}/>
        </div>
      </div>
    </div>
  );
};

export default VentasPage;
