import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategorias } from "../../store/categoriasSlice";
import { fetchSubcategorias, updateSubcategoria, deleteSubcategoria, addSubcategoria } from "../../store/subcategoriasSlice";
import BotonEnviar from "../Botones/BotonEnviar";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonAgregar from "../Botones/BotonAgregar";
import BotonEditar from "../Botones/BotonEditar";
import { useConfirm } from '../../utils/confirm/ConfirmContext';
import "./CrudSubcategorias.css";
import  notify  from '../../utils/notify'; // Asegúrate de que la ruta sea la correcta

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

  const handleAgregar = async () => {
    if (!nuevaSubcategoria.trim()) return;
    try {
      
      console.log("Respuesta de agregar subcategoría:", await dispatch(addSubcategoria({
        nombre: nuevaSubcategoria,
        categoriaId: categoriaSeleccionada,
      }))); // Log para depurar
      setNuevaSubcategoria("");
      dispatch(fetchSubcategorias(categoriaSeleccionada));
      notify.success('Subcategoría agregada correctamente.');
    } catch (error) {
      console.error('Error al agregar subcategoría:', error);
      notify.error('Error al agregar la subcategoría.');
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
      notify.success('Subcategoría actualizada correctamente.');
    } catch (error) {
      console.error('Error al editar subcategoría:', error);
      notify.error('Error al actualizar la subcategoría.');
    }
  };

  const confirm = useConfirm();

  const handleEliminar = async (subcat) => {
    try {
      const ok = await confirm(`¿Eliminar la subcategoría "${subcat.nombre}"?`);
      if (!ok) {
        notify.info('Eliminación cancelada');
        return;
      }
      try {
        console.log("Intentando eliminar subcategoría:", subcat.nombre);
        console.log("Respuesta de eliminar subcategoría:", await dispatch(deleteSubcategoria({ id: subcat.id }))); // Log para depurar
        dispatch(fetchSubcategorias(categoriaSeleccionada));
        notify.success('Subcategoría eliminada correctamente.');
      } catch (error) {
        console.error("Error deleting subcategoria:", error);
        notify.error('Error al eliminar la subcategoría', { autoClose: 5000 });
      }
    } catch (err) {
      // Confirm hook error (no-op)
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
          <div className="crud-subcategorias-form">
            <input
              type="text"
              placeholder="Nueva subcategoría"
              value={nuevaSubcategoria}
              onChange={(e) => setNuevaSubcategoria(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAgregar()}
              className="crud-subcategorias-input"
            />
            <BotonAgregar 
              onClick={handleAgregar}
              disabled={!nuevaSubcategoria.trim() || !categoriaSeleccionada}
            >
              Agregar
            </BotonAgregar>
          </div>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <BotonEnviar
                        onClick={() => handleGuardarEdit(subcat)}
                        small={true}
                      >
                        Guardar
                      </BotonEnviar>
                      <BotonCancelar
                        onClick={() => setEditId(null)}
                        small={true}
                      >
                        Cancelar
                      </BotonCancelar>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{subcat.nombre}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <BotonEditar
                        onClick={() => handleEditar(subcat)}
                        small={true}
                        className="boton-editar-chico"
                      >
                        Editar
                      </BotonEditar>
                      <BotonCancelar
                        onClick={() => handleEliminar(subcat)}
                        small={true}
                      >
                        Eliminar
                      </BotonCancelar>
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