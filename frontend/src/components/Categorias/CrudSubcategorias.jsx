import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategorias } from "../../store/categoriasSlice";
import { fetchSubcategorias, updateSubcategoria, deleteSubcategoria, addSubcategoria } from "../../store/subcategoriasSlice";
import "./CrudSubcategorias.css";

const CrudSubcategorias = () => {
  const dispatch = useDispatch();
  const categorias = useSelector((state) => state.categorias.items);
  const subcategorias = useSelector((state) => state.subcategorias.items);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  useEffect(() => {
    dispatch(fetchCategorias());
  }, [dispatch]);

  useEffect(() => {
    if (categoriaSeleccionada) {
      dispatch(fetchSubcategorias(categoriaSeleccionada));
    }
  }, [categoriaSeleccionada, dispatch]);

  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!nuevaSubcategoria.trim()) return;
    try {
      console.log("Intentando agregar subcategoría:", nuevaSubcategoria);
      console.log("Respuesta de agregar subcategoría:", await dispatch(addSubcategoria({
        nombre: nuevaSubcategoria,
        categoriaId: categoriaSeleccionada,
      }))); // Log para depurar
      setNuevaSubcategoria("");
      dispatch(fetchSubcategorias(categoriaSeleccionada));
    } catch (error) {
      console.error("Error adding subcategoria:", error);
    }
  };

  const handleEditar = (subcat) => {
    setEditId(subcat.id);
    setEditNombre(subcat.nombre);
  };

  const handleGuardarEdit = async (subcat) => {
    try {
      console.log("Intentando guardar edición de subcategoría:", editNombre);
      console.log("Respuesta de guardar edición:", await dispatch(updateSubcategoria({
        id: subcat.id,
        nombre: editNombre,
      }))); // Log para depurar
      setEditId(null);
      setEditNombre("");
      dispatch(fetchSubcategorias(categoriaSeleccionada));
    } catch (error) {
      console.error("Error editing subcategoria:", error);
    }
  };

  const handleEliminar = async (subcat) => {
    if (!window.confirm(`¿Eliminar la subcategoría "${subcat.nombre}"?`)) return;
    try {
      console.log("Intentando eliminar subcategoría:", subcat.nombre);
      console.log("Respuesta de eliminar subcategoría:", await dispatch(deleteSubcategoria({ id: subcat.id }))); // Log para depurar
      dispatch(fetchSubcategorias(categoriaSeleccionada));
    } catch (error) {
      console.error("Error deleting subcategoria:", error);
    }
  };

  console.log("Estado completo de subcategorias:", subcategorias);
  console.log("Categoria seleccionada:", categoriaSeleccionada);

  const subcategoriasActivas = subcategorias.filter((subcat) => subcat.activo);

  console.log("Subcategorias activas:", subcategoriasActivas);

  return (
    <section className="crud-subcategorias">
      <h2>Subcategorías</h2>
      <select
        value={categoriaSeleccionada || ""}
        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        className="crud-subcategorias-select-categoria"
      >
        <option value="" disabled>
          Selecciona una categoría
        </option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.nombre}
          </option>
        ))}
      </select>
      {categoriaSeleccionada && (
        <>
          <form onSubmit={handleAgregar} className="crud-subcategorias-form">
            <input
              type="text"
              placeholder="Nueva subcategoría"
              value={nuevaSubcategoria}
              onChange={(e) => setNuevaSubcategoria(e.target.value)}
              className="crud-subcategorias-input"
            />
            <button type="submit" className="crud-subcategorias-btn-agregar">
              Agregar
            </button>
          </form>
          <ul className="crud-subcategorias-list">
            {subcategoriasActivas.map((subcat) => (
              <li key={subcat.id} className="crud-subcategorias-item">
                {editId === subcat.id ? (
                  <>
                    <input
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="crud-subcategorias-edit-input"
                      autoFocus
                    />
                    <button
                      onClick={() => handleGuardarEdit(subcat)}
                      className="crud-subcategorias-btn-guardar"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="crud-subcategorias-btn-cancelar"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <span>{subcat.nombre}</span>
                    <div style={{ display: "flex", gap: "0.3rem" }}>
                      <button
                        onClick={() => handleEditar(subcat)}
                        className="crud-subcategorias-btn-editar"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(subcat)}
                        className="crud-subcategorias-btn-eliminar"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
};

export default CrudSubcategorias;