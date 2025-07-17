import React from "react";
import { FaShoppingCart } from "react-icons/fa";
import "./botonCarrito.css";

const BotonCarrito = ({ cartCount = 3, onClick }) => (
  <button
    className="boton-carrito-btn"
    onClick={onClick}
  >
    <span className="boton-carrito-icon"><FaShoppingCart /></span>
    <span className="boton-carrito-label">Carrito</span>
    {cartCount > 0 && (
      <span className="boton-carrito-badge">{cartCount}</span>
    )}
  </button>
);

export default BotonCarrito;
