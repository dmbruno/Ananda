import React from "react";
import './App.css'
import "./components/Sidebar/sidebar.css";
import "./components/SidebarCategorias/DropdownCategoriasSidebar.css";
import { Routes, Route } from "react-router-dom";
import DashboardPage from './pages/DashboardPage';
import CategoriasPage from './pages/CategoriasPage';
import StockPage from './pages/StockPage';
import GestionCajasPage from './pages/GestionCajasPage';
import VentasPage from "./pages/VentasPage";
import CarritoPage from "./pages/CarritoPage";
import ClientePage from "./pages/ClientePage";
import VentasHistoricasPage from "./pages/VentasHistoricasPage";
import UsuariosPage from './pages/UsuariosPage';

function App() {
  return (
    <div className="app-layout">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/ventas/historicas" element={<VentasHistoricasPage />} />
          <Route path="/ventas/nueva" element={<CarritoPage />} />
          <Route path="/ventas" element={<VentasPage />} />
          <Route path="/clientes" element={<ClientePage />} />
          <Route path="/cumpleanos" element={<div>Cumpleaños - En desarrollo</div>} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/carrito" element={<div>Carrito - En desarrollo</div>} />
          <Route path="/cajas" element={<GestionCajasPage />} />
          
          {/* Ruta dinámica de Stock para cualquier subcategoría */}
          <Route path="/stock/:subcategoria" element={<StockPage />} />
          
          {/* Agrega aquí más rutas según lo necesites */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
