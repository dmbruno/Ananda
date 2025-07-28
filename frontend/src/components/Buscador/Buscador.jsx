import React from 'react';
import './Buscador.css';

const Buscador = ({ value, onChange, placeholder = 'Buscar...' }) => {
  return (
    <div className="buscador-container">
      <input
        type="text"
        className="buscador-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
      />
      <span className="buscador-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b0b3bb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
    </div>
  );
};

export default Buscador;
