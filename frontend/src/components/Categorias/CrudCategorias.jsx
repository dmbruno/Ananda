import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategorias, addCategoria } from "../../store/categoriasSlice";
import BotonEnviar from "../Botones/BotonEnviar";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonAgregar from "../Botones/BotonAgregar";
import BotonEditar from "../Botones/BotonEditar";
import axios from "axios";
import { useConfirm } from '../../utils/confirm/ConfirmContext';
import "./CrudCategorias.css";
import  notify  from '../../utils/notify'; // Asegúrate de que la ruta sea correcta

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

  const confirm = useConfirm();

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
      notify.success('Categoría agregada correctamente.');
    } catch (err) {
      console.error('Error al agregar categoría:', err);
      notify.error('Error al agregar la categoría.');
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
      notify.success('Categoría actualizada correctamente.');
    } catch (err) {
      console.error('Error al editar categoría:', err);
      notify.error('Error al actualizar la categoría.');
    }
  };

  const handleEliminar = async (cat) => {
    try {
      const ok = await confirm(`¿Eliminar la categoría "${cat.nombre}"?`);
      if (!ok) {
        notify.info('Eliminación cancelada');
        return;
      }
      setEliminandoId(cat.id);
      try {
        await axios.delete(`/api/categorias/${cat.id}`);
        dispatch(fetchCategorias());
        notify.success('Categoría eliminada correctamente.');
      } catch (err) {
        console.error('Error al eliminar categoría:', err);
        notify.error('Error al eliminar la categoría', { autoClose: 5000 });
      } finally {
        setEliminandoId(null);
      }
    } catch (err) {
      // Confirm hook error (no-op)
    }
  };

  return (
    <section className="crud-categorias">
      <h2>Categorías</h2>
      <div className="crud-categorias-form">
        <input
          type="text"
          placeholder="Nueva categoría"
          value={nuevaCategoria}
          onChange={(e) => setNuevaCategoria(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAgregar(e)}
          className="crud-categorias-input"
        />
        <BotonAgregar
          onClick={handleAgregar}
          disabled={agregando || !nuevaCategoria.trim()}
        >
          Agregar
        </BotonAgregar>
      </div>
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
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <BotonEnviar
                    onClick={() => handleGuardarEdit(cat)}
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
                <span>{cat.nombre}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <BotonEditar
                    onClick={() => handleEditar(cat)}
                    small={true}
                    className={"boton-editar-chico"}
                  >
                    Editar
                  </BotonEditar>
                  <BotonCancelar
                    onClick={() => handleEliminar(cat)}
                    disabled={eliminandoId === cat.id}
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
    </section>
  );
};

export default CrudCategorias;
