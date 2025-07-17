import React, { useState } from "react";
import './App.css'
import Sidebar from "./components/Sidebar/sidebar";
import "./components/Sidebar/sidebar.css";
import DropdownCategorias from "./components/SidebarCategorias/DropdownCategoriasSidebar";
import DashboardPage from './pages/DashboardPage';
import CategoriasPage from './pages/CategoriasPage';
import "./components/SidebarCategorias/DropdownCategoriasSidebar.css";
import { Routes, Route } from "react-router-dom";

function App() {
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState(null);

  // Detectar click en Stock
  const handleSidebarItemClick = (label) => {
    setActiveSidebarItem(label);
    if (label === "Stock") setShowDropdownCategorias(true);
    else setShowDropdownCategorias(false);
  };

  // Cerrar sidebar y contraer menú al elegir subcategoría o cerrar menú
  const closeCategoriasSidebar = () => {
    setShowDropdownCategorias(false);
    setActiveSidebarItem(null);
  };

  const handleSubcategoriaSelect = (sub) => {
    closeCategoriasSidebar();
    // Aquí podrías navegar/renderizar la página de stock con la subcategoría seleccionada
  };

  return (
    <div className="app-layout">
      <div style={{ position: 'relative' }}>
        <Sidebar onItemClick={handleSidebarItemClick} activeItem={activeSidebarItem} />
        {showDropdownCategorias && (
          <DropdownCategorias
            visible={showDropdownCategorias}
            onSelectSubcategoria={handleSubcategoriaSelect}
            onClose={closeCategoriasSidebar}
          />
        )}
      </div>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          {/* Agrega aquí más rutas según lo necesites */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
