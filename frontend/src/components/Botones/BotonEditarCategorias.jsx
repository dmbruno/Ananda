import React from "react";
import "./BotonEditarCategorias.css";

const BotonEditarCategorias = ({ onClick }) => (
  <button
    className="boton-editar-categorias"
    onClick={onClick}
  >
    <span className="boton-editar-categorias-icon">✏️</span>
    Editar categorías
  </button>
);

export default BotonEditarCategorias;
