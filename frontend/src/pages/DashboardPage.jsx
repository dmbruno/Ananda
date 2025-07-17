import React from "react";
import GraficoVentas from "../components/GraficoVentas/GraficoVentas.jsx";
import MetodoDePago from "../components/GraficoMetodoDePago/MetodoDePago.jsx";
import "./DashboardPage.css";
import TopMasVendidos from "../components/TopMasVendidos/TopMasVendidos.jsx";
import Cumples from "../components/Cumples/cumples.jsx";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar.jsx";

const DashboardPage = () => {
  return (
    <div className="dashboard-main">
      <HeaderUserBar />
      <h1 className="dashboard-title">Dashboard</h1>
      <div className="dashboard-row dashboard-row-top">
        <div className="dashboard-ventas">
          <GraficoVentas />
        </div>
        <div className="dashboard-celda dashboard-celda-arriba-derecha">
          <MetodoDePago />
        </div>
      </div>
      <div className="dashboard-row dashboard-row-bottom">
        <div className="dashboard-celda dashboard-celda-abajo-izquierda">
          <TopMasVendidos/>
        </div>
        <div className="dashboard-celda dashboard-celda-abajo-derecha">
          <Cumples />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
