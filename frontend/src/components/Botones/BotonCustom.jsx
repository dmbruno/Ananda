import React from "react";
import "./BotonCustom.css";

const BotonCustom = ({ 
  onClick, 
  children, 
  disabled = false,
  variant = "primary", // primary, secondary, success, info
  icon = null,
  size = "medium", // small, medium, large
  className = ""
}) => {
  return (
    <button 
      className={`boton-custom boton-custom--${variant} boton-custom--${size} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="boton-custom-icon">{icon}</span>}
      <span className="boton-custom-text">{children}</span>
    </button>
  );
};

export default BotonCustom;
