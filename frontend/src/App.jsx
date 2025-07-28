import React, { useState } from "react";
import './App.css'
import Sidebar from "./components/Sidebar/sidebar";
import "./components/Sidebar/sidebar.css";
import DropdownCategorias from "./components/SidebarCategorias/DropdownCategoriasSidebar";
import DashboardPage from './pages/DashboardPage';
import CategoriasPage from './pages/CategoriasPage';
import StockPage from './pages/StockPage';
import "./components/SidebarCategorias/DropdownCategoriasSidebar.css";
import { Routes, Route, useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState(null);

  // Detectar click en Stock
  const handleSidebarItemClick = (label) => {
    console.log("handleSidebarItemClick called with:", label);
    console.log("Current showDropdownCategorias:", showDropdownCategorias);
    
    setActiveSidebarItem(label);
    
    if (label === "Stock") {
      console.log("Stock clicked - toggling dropdown");
      // Toggle del dropdown en lugar de solo setear a true
      setShowDropdownCategorias(prev => {
        console.log("Previous dropdown state:", prev, "-> New state:", !prev);
        return !prev;
      });
      // NO navegar, solo mostrar dropdown
    } else {
      console.log("Other item clicked:", label);
      setShowDropdownCategorias(false);
      // Navegar para otros items
      switch(label) {
        case "Dashboard":
          navigate("/dashboard");
          break;
        case "Nueva Venta":
          navigate("/ventas/nueva");
          break;
        case "ventas":
          navigate("/ventas");
          break;
        case "Categorías":
          navigate("/categorias");
          break;
        case "Clientes":
          navigate("/clientes");
          break;
        case "Cumpleaños":
          navigate("/cumpleanos");
          break;
        case "Usuarios":
          navigate("/usuarios");
          break;
        case "Carrito":
          navigate("/carrito");
          break;
        default:
          break;
      }
    }
  };

  // Cerrar sidebar y contraer menú al elegir subcategoría o cerrar menú
  const closeCategoriasSidebar = () => {
    setShowDropdownCategorias(false);
    setActiveSidebarItem(null);
  };

  const handleSubcategoriaSelect = (subcategoria, categoria) => {
    closeCategoriasSidebar();
    // Navegar a la página de stock con la subcategoría seleccionada
    const subcategoriaUrl = subcategoria.nombre.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'y');
    navigate(`/stock/${subcategoriaUrl}`, {
      state: {
        categoria: categoria.nombre,
        subcategoria: subcategoria.nombre,
        subcategoriaId: subcategoria.id,
        categoriaId: subcategoria.categoria_id
      }
    });
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
          <Route path="/ventas/nueva" element={<div>Nueva Venta - En desarrollo</div>} />
          <Route path="/ventas" element={<div>Ventas - En desarrollo</div>} />
          <Route path="/clientes" element={<div>Clientes - En desarrollo</div>} />
          <Route path="/cumpleanos" element={<div>Cumpleaños - En desarrollo</div>} />
          <Route path="/usuarios" element={<div>Usuarios - En desarrollo</div>} />
          <Route path="/carrito" element={<div>Carrito - En desarrollo</div>} />
          
          {/* Ruta dinámica de Stock para cualquier subcategoría */}
          <Route path="/stock/:subcategoria" element={<StockPage />} />
          
          {/* Agrega aquí más rutas según lo necesites */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
