import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/sidebar";
import DropdownCategoriasSidebar from "../components/SidebarCategorias/DropdownCategoriasSidebar";
import "./VentasPage.css";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar";
import MetodoDePago from "../components/GraficoMetodoDePago/MetodoDePago";
import GraficoVentas from "../components/GraficoVentas/GraficoVentas";
import BuscadorPorFechas from "../components/Buscador/BuscadorPorFechas";
import TopMasVendidos from "../components/TopMasVendidos/TopMasVendidos";
import "../components/TopMasVendidos/TopMasVendidos.ventas.css";
import UltimosVendidos from "../components/UltimosVendidos/UltimosVendidos";

const VentasPage = () => {
  // Estado local para manejar la sidebar
  const [activeSidebarItem, setActiveSidebarItem] = useState("ventas");
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  const navigate = useNavigate();

  // Establecer el item activo cuando se carga la página
  useEffect(() => {
    setActiveSidebarItem("ventas");
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
    <div className="ventas-page-wrapper">
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
      <div className="ventas-header-bar">
        <h2 className="dashboard-title">Panel de ventas</h2>
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
