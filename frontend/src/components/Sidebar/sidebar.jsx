import React from "react";
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import SidebarItem from "./sidebarItem";
import BotonCarrito from "./Carrito/BotonCarrito";
import { useCarritoCount } from "../../hooks/useCarritoCount";
import { FaChartBar, FaReceipt, FaUsers, FaBox, FaBirthdayCake, FaUserCog, FaPlus, FaTags, FaCashRegister, FaHistory, FaSignOutAlt, FaExchangeAlt } from "react-icons/fa";
import ModalCambioPrenda from "../Cambios/ModalCambioPrenda";

// Definir los items base del sidebar
const getItems = (isAdmin) => {
  const baseItems = [
    { label: "Dashboard", icon: <FaChartBar />, route: "/dashboard" },
    { label: "Nueva Venta", icon: <FaPlus />, route: "/ventas/nueva" },
    { label: "ventas", icon: <FaReceipt />, route: "/ventas" },
    { label: "Stock", icon: <FaBox /> },
    { label: "Categorías", icon: <FaTags />, route: "/categorias" },
    { label: "Clientes", icon: <FaUsers />, route: "/clientes" },
    { label: "Ventas Historicas", icon: <FaHistory />, route: "/ventas/historicas" },
    { label: "Gestión de Cajas", icon: <FaCashRegister />, route: "/cajas" },
  ];
  
  // Solo agregar el ítem de Usuarios si el usuario es administrador
  if (isAdmin) {
    baseItems.splice(6, 0, { label: "Usuarios", icon: <FaUserCog />, route: "/usuarios" });
  }
  
  return baseItems;
};

const Sidebar = ({ onItemClick, activeItem, keepExpanded }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartCount = useCarritoCount();
  const [isCambioOpen, setIsCambioOpen] = React.useState(false);
  
  // Obtener información del usuario desde Redux
  const user = useSelector(state => state.auth.user);
  // Verificar si el usuario es administrador
  const isAdmin = user && user.is_admin === true;
  
  // Obtener los items del sidebar según el rol del usuario
  const items = getItems(isAdmin);

  const handleCarritoClick = () => {
    console.log('🛒 Navegando al carrito desde sidebar...');
    // Navegar a la pantalla de ventas
    navigate('/ventas/nueva');
    // Marcar como activo el item de ventas
    onItemClick && onItemClick('Nueva Venta');
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Error al hacer logout:', error);
      // Incluso si hay error, redirigir al login
      navigate('/login');
    }
  };

  const handleItemClick = (item) => {
    if (item.label === 'Cambios') {
      setIsCambioOpen(true);
    } else if (item.route) {
      navigate(item.route);
    }
    onItemClick && onItemClick(item.label);
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
            onClick={() => handleItemClick(item)} 
            active={activeItem === item.label}
          />
        ))}
      </nav>
      <div className="sidebar-footer" style={{position: 'relative'}}>
        <BotonCarrito cartCount={cartCount} onClick={handleCarritoClick} />
        
        {/* Botón de Logout */}
        <button 
          className="logout-button"
          onClick={handleLogout}
          title="Cerrar Sesión"
        >
          <FaSignOutAlt className="logout-icon" />
          <span className="logout-label">Cerrar Sesión</span>
        </button>
      </div>
      <ModalCambioPrenda isOpen={isCambioOpen} onClose={() => setIsCambioOpen(false)} />
    </aside>
  );
};

export default Sidebar;
