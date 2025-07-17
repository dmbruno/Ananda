import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategorias, addCategoria } from "../../store/categoriasSlice";
import axios from "axios";
import "./CrudCategorias.css";

const CrudCategorias = () => {
  const dispatch = useDispatch();
  const categorias = useSelector((state) => state.categorias.items);
  const status = useSelector((state) => state.categorias.status);
  const error = useSelector((state) => state.categorias.error);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [agregando, setAgregando] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    dispatch(fetchCategorias());
  }, [dispatch]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    setAgregando(true);
    try {
      await axios.post("/api/categorias/", { nombre: nuevaCategoria });
      dispatch(fetchCategorias());
      setNuevaCategoria("");
    } catch (err) {
      // Manejo de error
    } finally {
      setAgregando(false);
    }
  };

  const handleEditar = (cat) => {
    setEditId(cat.id);
    setEditNombre(cat.nombre);
  };

  const handleGuardarEdit = async (cat) => {
    try {
      await axios.put(`/api/categorias/${cat.id}`, { nombre: editNombre });
      setEditId(null);
      setEditNombre("");
      dispatch(fetchCategorias());
    } catch (err) {
      // Manejo de error
    }
  };

  const handleEliminar = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) return;
    setEliminandoId(cat.id);
    try {
      await axios.delete(`/api/categorias/${cat.id}`);
      dispatch(fetchCategorias());
    } catch (err) {
      // Manejo de error
    } finally {
      setEliminandoId(null);
    }
  };

  return (
    <section className="crud-categorias">
      <h2>Categorías</h2>
      <form onSubmit={handleAgregar} className="crud-categorias-form">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          className="crud-categorias-input"
        />
        <button
          type="submit"
          disabled={agregando || !nuevaCategoria.trim()}
          className="crud-categorias-btn-agregar"
        >
          Agregar
        </button>
      </form>
      {status === "loading" && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul className="crud-categorias-list">
        {categorias.map((cat) => (
          <li key={cat.id} className="crud-categorias-item">
            {editId === cat.id ? (
              <>
                <input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="crud-categorias-edit-input"
                  autoFocus
                />
                <button
                  onClick={() => handleGuardarEdit(cat)}
                  className="crud-categorias-btn-guardar"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="crud-categorias-btn-cancelar"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span>{cat.nombre}</span>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button
                    onClick={() => handleEditar(cat)}
                    className="crud-categorias-btn-editar"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminar(cat)}
                    disabled={eliminandoId === cat.id}
                    className="crud-categorias-btn-eliminar"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CrudCategorias;
