import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/sidebar";
import DropdownCategoriasSidebar from "../components/SidebarCategorias/DropdownCategoriasSidebar";
import GraficoVentas from "../components/GraficoVentas/GraficoVentas.jsx";
import MetodoDePago from "../components/GraficoMetodoDePago/MetodoDePago.jsx";
import "./DashboardPage.css";
import TopMasVendidos from "../components/TopMasVendidos/TopMasVendidos.jsx";
import Cumples from "../components/Cumples/cumples.jsx";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar.jsx";

const DashboardPage = () => {
  // Estado local para manejar la sidebar
  const [activeSidebarItem, setActiveSidebarItem] = useState("Dashboard");
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  const navigate = useNavigate();

  // Establecer el item activo cuando se carga la página
  useEffect(() => {
    setActiveSidebarItem("Dashboard");
  }, []);

  // Funciones para manejar la sidebar
  const handleSidebarItemClick = (label) => {
    setActiveSidebarItem(label);
    if (label === "Stock") {
      setShowDropdownCategorias(prev => !prev);
    } else {
      setShowDropdownCategorias(false);
    }
  };

  const closeCategoriasSidebar = () => {
    setShowDropdownCategorias(false);
  };

  const handleSubcategoriaSelect = (subcategoria, categoria) => {
    closeCategoriasSidebar();
    const subcategoriaUrl = subcategoria.nombre.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'y');
    navigate(`/stock/${subcategoriaUrl}`, {
      state: { subcategoria, categoria }
    });
  };

  return (
    <div className="dashboard-main">
      <Sidebar 
        activeItem={activeSidebarItem}
        onItemClick={handleSidebarItemClick}
        keepExpanded={showDropdownCategorias && activeSidebarItem === "Stock"}
      />
      {showDropdownCategorias && (
        <DropdownCategoriasSidebar 
          visible={true}
          onClose={closeCategoriasSidebar}
          onSelectSubcategoria={handleSubcategoriaSelect}
        />
      )}
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
