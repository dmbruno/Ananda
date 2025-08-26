import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/sidebar";
import DropdownCategoriasSidebar from "../components/SidebarCategorias/DropdownCategoriasSidebar";
import CrudCategorias from "../components/Categorias/CrudCategorias";
import CrudSubcategorias from "../components/Categorias/CrudSubcategorias";

import "./CategoriasPage.css";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar.jsx";

const CategoriasPage = () => {
  // Estado local para manejar la sidebar
  const [activeSidebarItem, setActiveSidebarItem] = useState("Categorías");
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  const navigate = useNavigate();

  // Establecer el item activo cuando se carga la página
  useEffect(() => {
    setActiveSidebarItem("Categorías");
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
    <div className="categorias-page-layout">
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
      <header className="categorias-header">
        <HeaderUserBar />
        <h1 className="dashboard-title">Categorías</h1>
      </header>
      <div className="categorias-content-wrapper">
        <main className="categorias-main-row">
          <div className="crud-categorias-col1">
            <CrudCategorias />
          </div>
          <div className="crud-categorias-col2">
            <CrudSubcategorias />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoriasPage;
