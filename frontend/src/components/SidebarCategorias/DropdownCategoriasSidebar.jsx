import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategorias } from "../../store/categoriasSlice";
import { fetchSubcategorias } from "../../store/subcategoriasSlice";
import "./DropdownCategoriasSidebar.css";
import BotonEditarCategorias from "../Botones/BotonEditarCategorias";
import { useNavigate } from "react-router-dom";

const DropdownCategoriasSidebar = ({ onSelectSubcategoria, visible, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categorias = useSelector((state) => state.categorias.items);
  const subcategorias = useSelector((state) => state.subcategorias.items);
  const [openCategoriaId, setOpenCategoriaId] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (visible) {
      console.log("Dropdown visible, fetching categories and subcategories...");
      dispatch(fetchCategorias());
      if (openCategoriaId) {
        dispatch(fetchSubcategorias(openCategoriaId));
      }
    }
  }, [visible, dispatch, openCategoriaId]);

  // Cierre por click afuera
  useEffect(() => {
    if (!visible) return;
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  const handleCategoriaClick = (cat) => {
    console.log("Category clicked:", cat);
    if (openCategoriaId === cat.id) {
      setOpenCategoriaId(null); // Collapse the category
    } else {
      setOpenCategoriaId(cat.id); // Expand the category
    }
  };

  const handleSubcategoriaClick = (sub, categoria) => {
    console.log("Subcategory clicked:", sub, "from category:", categoria);
    onSelectSubcategoria(sub, categoria);
  };

  if (!visible) return null;

  return (
    <aside 
      className="dropdown-categorias-sidebar" 
      ref={sidebarRef} 
      style={{ 
        fontFamily: 'Rajdhani, sans-serif'
      }}
    >
      <div className="dropdown-categorias-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="dropdown-categorias-title">Categorías</h3>
          <button
            className="dropdown-categorias-close-btn"
            aria-label="Cerrar menú de categorías"
            onClick={() => {
              console.log("Close button clicked");
              onClose();
            }}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888', marginLeft: '1rem' }}
          >
            ×
          </button>
        </div>
        <ul className="dropdown-categorias-list">
          {categorias.map((cat) => (
            <li key={cat.id}>
              <button
                className="dropdown-categorias-item"
                onClick={() => handleCategoriaClick(cat)}
                aria-expanded={openCategoriaId === cat.id}
              >
                {cat.nombre}
              </button>
              {openCategoriaId === cat.id && (
                <ul className="dropdown-subcategorias-dropdown">
                  {subcategorias
                    .filter((sub) => sub.categoria_id === cat.id)
                    .map((sub) => (
                      <li key={sub.id}>
                        <button
                          className="dropdown-subcategorias-item"
                          onClick={() => handleSubcategoriaClick(sub, cat)}
                        >
                          {sub.nombre}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <BotonEditarCategorias onClick={() => {
          console.log("Edit categories button clicked");
          navigate('/categorias');
          if (onClose) onClose();
        }} />
      </div>
    </aside>
  );
};

export default DropdownCategoriasSidebar;