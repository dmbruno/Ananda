import React from "react";
import "./HeaderUserBar.css";
import "../Sidebar/Carrito/botonCarrito.css";

const HeaderUserBar = ({ cartCount = 3 }) => {
  return (
    <div className="header-userbar">
      <span className="header-username">Romina Merluzzi</span>
      <span className="header-cart" style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h2l.4 2M7 13h10l4-8H5.4"/><path d="M7 13L5.4 5M7 13l-2 4h13"/></svg>
        {cartCount > 0 && (
          <span className="boton-carrito-badge" style={{ top: '-0.9rem', right: '-1.1rem' }}>{cartCount}</span>
        )}
      </span>
    </div>
  );
};

export default HeaderUserBar;
