import React from "react";

const BotonEditar = ({ onClick, children }) => (
  <button 
    className="modal-whatsapp-send" 
    onClick={onClick}
    style={{
      backgroundColor: '#ecc44bff',
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      color: 'white',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#ffbf00ff';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = '#ecc44bff';
    }}
  >
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{marginRight:3}} xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#ecc44bff"/>
      <path d="M12 6l2 2-8 8H4v-2l8-8z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 4l2 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    {children || "Editar"}
  </button>
);

export default BotonEditar;
