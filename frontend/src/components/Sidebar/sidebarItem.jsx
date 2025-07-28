import React from "react";
import { NavLink } from "react-router-dom";

const SidebarItem = ({ label, icon, route, active, notification, onClick, className, cartCount }) => {
  const isCart = className === "sidebar-cart-btn";
  const isStock = label === "Stock";
  const computedClass =
    (isCart ? "sidebar-cart-btn" : "sidebar-item") +
    ((active ? " active" : ""));

  // Si es Stock, usar div en lugar de NavLink para evitar navegación automática
  if (isStock) {
    return (
      <div
        className={computedClass}
        onClick={onClick}
        style={{ position: isCart ? "relative" : undefined, cursor: "pointer" }}
      >
        <span className="sidebar-icon">{icon}</span>
        <span className="sidebar-label">{label}</span>
        {isCart && cartCount > 0 && (
          <span className="sidebar-cart-badge">{cartCount}</span>
        )}
        {notification && !isCart && <span className="sidebar-notification-dot" />}
      </div>
    );
  }

  return (
    <NavLink
      to={route}
      className={computedClass}
      onClick={onClick}
      style={{ position: isCart ? "relative" : undefined }}
    >
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
      {isCart && cartCount > 0 && (
        <span className="sidebar-cart-badge">{cartCount}</span>
      )}
      {notification && !isCart && <span className="sidebar-notification-dot" />}
    </NavLink>
  );
};

export default SidebarItem;
