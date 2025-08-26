import React from "react";
import { useNavigate } from 'react-router-dom';
import SidebarItem from "./sidebarItem";
import BotonCarrito from "./Carrito/BotonCarrito";
import { useCarritoCount } from "../../hooks/useCarritoCount";
import { FaChartBar, FaReceipt, FaUsers, FaBox, FaBirthdayCake, FaUserCog, FaPlus, FaTags, FaCashRegister, FaHistory } from "react-icons/fa";

const items = [
  { label: "Dashboard", icon: <FaChartBar />, route: "/dashboard" },
  { label: "Nueva Venta", icon: <FaPlus />, route: "/ventas/nueva" },
  { label: "ventas", icon: <FaReceipt />, route: "/ventas" },
  { label: "Stock", icon: <FaBox /> },
  { label: "Categorías", icon: <FaTags />, route: "/categorias" },
  { label: "Clientes", icon: <FaUsers />, route: "/clientes" },
  { label: "Usuarios", icon: <FaUserCog />, route: "/usuarios" },
  { label: "Ventas Historicas", icon: <FaHistory />, route: "/ventas/historicas" },
  { label: "Gestión de Cajas", icon: <FaCashRegister />, route: "/cajas" },
];

const Sidebar = ({ onItemClick, activeItem, keepExpanded }) => {
  const navigate = useNavigate();
  const cartCount = useCarritoCount();

  const handleCarritoClick = () => {
    console.log('🛒 Navegando al carrito desde sidebar...');
    // Navegar a la pantalla de ventas
    navigate('/ventas/nueva');
    // Marcar como activo el item de ventas
    onItemClick && onItemClick('Nueva Venta');
  };

  // Determinar la clase CSS basada en si debe mantenerse expandida
  const sidebarClass = `sidebar ${keepExpanded ? 'sidebar-stock-active' : ''}`;

  return (
    <aside className={sidebarClass}>
      <div className="sidebar-header">
        <h2>Ananda</h2>
      </div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <SidebarItem 
            key={item.label} 
            {...item} 
            onClick={() => onItemClick && onItemClick(item.label)} 
            active={activeItem === item.label}
          />
        ))}
      </nav>
      <div className="sidebar-footer" style={{position: 'relative'}}>
        <BotonCarrito cartCount={cartCount} onClick={handleCarritoClick} />
      </div>
    </aside>
  );
};

export default Sidebar;
