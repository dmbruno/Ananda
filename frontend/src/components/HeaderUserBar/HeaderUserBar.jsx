import React from "react";
import { useNavigate } from 'react-router-dom';
import { useCarritoCount } from "../../hooks/useCarritoCount";
import "./HeaderUserBar.css";
import "../Sidebar/Carrito/botonCarrito.css";

const HeaderUserBar = () => {
  const navigate = useNavigate();
  const cartCount = useCarritoCount();

  const handleCarritoClick = () => {
    console.log('🛒 Navegando al carrito desde header...');
    navigate('/ventas/nueva');
  };

  return (
    <div className="header-userbar">
      <span className="header-username">Romina Merluzzi</span>
      <span 
        className="header-cart" 
        style={{ 
          position: 'relative', 
          display: 'inline-block',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          transition: 'background-color 0.2s ease'
        }}
        onClick={handleCarritoClick}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="20" cy="21" r="1"/>
          <path d="M1 1h2l.4 2M7 13h10l4-8H5.4"/>
          <path d="M7 13L5.4 5M7 13l-2 4h13"/>
        </svg>
        {cartCount > 0 && (
          <span className="boton-carrito-badge" style={{ top: '-0.9rem', right: '-1.1rem' }}>{cartCount}</span>
        )}
      </span>
    </div>
  );
};

export default HeaderUserBar;
