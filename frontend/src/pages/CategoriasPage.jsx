import React from "react";
import CrudCategorias from "../components/Categorias/CrudCategorias";
import CrudSubcategorias from "../components/Categorias/CrudSubcategorias";

import "./CategoriasPage.css";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar.jsx";

const CategoriasPage = () => {
  return (
    <div className="categorias-page-layout">
      <header className="categorias-header">
        <HeaderUserBar />
        <h1>Categorías</h1>
      </header>
      <div className="categorias-content-wrapper">
        <main className="categorias-main-row">
          <div className="crud-categorias-col1">
            <CrudCategorias />
          </div>
          <div className="crud-categorias-col2">
            <CrudSubcategorias />
          </div>
        </main>
      </div>
    </div>
  );
};

export default CategoriasPage;
