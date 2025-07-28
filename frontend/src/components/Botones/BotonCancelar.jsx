import React from "react";

const BotonCancelar = ({ onClick, children, small = false }) => (
  <button 
    className="modal-whatsapp-cancel" 
    onClick={onClick}
    style={small ? {
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem'
    } : {}}
  >
    <svg 
      width={small ? "14" : "18"} 
      height={small ? "14" : "18"} 
      viewBox="0 0 20 20" 
      fill="none" 
      style={{marginRight: small ? 3 : 4}} 
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="10" fill="#e57373"/>
      <path d="M6 6l8 8M14 6l-8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
    {children || "Cancelar"}
  </button>
);

export default BotonCancelar;
