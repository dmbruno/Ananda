import React from "react";
import "./BotonEditar.css";

const BotonEditar = ({ onClick, children, className }) => (
  <button 
    className={`boton-editar-producto ${className}`} 
    onClick={onClick}
  >
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{marginRight:3}} className="boton-editar-producto-icon" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#fca401"/>
      <path d="M12 6l2 2-8 8H4v-2l8-8z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 4l2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    {children || "Editar"}
  </button>
);

export default BotonEditar;
