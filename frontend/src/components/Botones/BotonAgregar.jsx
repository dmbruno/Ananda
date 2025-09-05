import React from "react";
import "./BotonAgregar.css";

const BotonAgregar = ({ onClick, children, disabled, className = "" }) => (
  <button 
    className={`boton-agregar ${className}`} 
    onClick={onClick}
    disabled={disabled}
  >
    <svg 
      className="boton-agregar-icon" 
      viewBox="0 0 20 20" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="10" fill={disabled ? '#999' : '#2196f3'}/>
      <path d="M10 6v8M6 10h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    {children || "Agregar"}
  </button>
);

export default BotonAgregar;
