import React from "react";
import SidebarItem from "./sidebarItem";
import BotonCarrito from "./Carrito/BotonCarrito";
import { FaChartBar, FaShoppingCart, FaUsers, FaBox, FaBirthdayCake, FaUser, FaPlus } from "react-icons/fa";

const items = [
  { label: "Dashboard", icon: <FaChartBar />, route: "/dashboard" },
  { label: "Nueva Venta", icon: <FaPlus />, route: "/ventas/nueva" },
  { label: "ventas", icon: <FaShoppingCart />, route: "/ventas" },
  { label: "Stock", icon: <FaBox />, route: "/stock", active: true },
  { label: "Clientes", icon: <FaUsers />, route: "/clientes" },
  { label: "Cumpleaños", icon: <FaBirthdayCake />, route: "/cumpleanos" },
  { label: "Usuarios", icon: <FaUser />, route: "/usuarios" },
];

const Sidebar = ({ onItemClick, activeItem, cartCount = 3 }) => (
  <aside className={"sidebar" + (activeItem === "Stock" ? " sidebar-expanded" : "") }>
    <div className="sidebar-header">
      <h2>Ananda</h2>
    </div>
    <nav className="sidebar-nav">
      {items.map((item) => (
        <SidebarItem key={item.label} {...item} onClick={() => onItemClick && onItemClick(item.label)} active={activeItem === item.label} />
      ))}
    </nav>
    <div className="sidebar-footer" style={{position: 'relative'}}>
      <BotonCarrito cartCount={cartCount} onClick={() => onItemClick && onItemClick('Carrito')} />
    </div>
  </aside>
);

export default Sidebar;
