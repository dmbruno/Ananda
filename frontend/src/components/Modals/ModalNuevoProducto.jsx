import React, { useRef, useState, useEffect } from "react";
import "./ModalNuevoProducto.css";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonEnviar from "../Botones/BotonEnviar";
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategorias } from '../../store/categoriasSlice';
import { fetchSubcategorias, selectSubcategoriasByCategoria } from '../../store/subcategoriasSlice';
import { fetchProductos } from '../../store/productosSlice';
import axios from 'axios';

const camposIniciales = {
  nombre: "",
  categoria: "",
  subcategoria: "",
  costo: "",
  precio_venta: "",
  talle: "",
  sku: "",
  marca: "",
  stock: "",
  stock_minimo: "",
  color: "",
  temporada: "",
  estado: "activa",
  ingreso: "",
  imagen: null,
};

const ModalNuevoProducto = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const categorias = useSelector((state) => state.categorias.items);
  const status = useSelector((state) => state.categorias.status);
  const [exiting, setExiting] = useState(false);
  const timeoutRef = useRef();
  const [campos, setCampos] = useState(camposIniciales);

  const subcategorias = useSelector((state) => selectSubcategoriasByCategoria(state, campos.categoria)); // Revertir al selector anterior

  // Filtrar dinámicamente las subcategorías según la categoría seleccionada
  const subcategoriasFiltradas = campos.categoria
    ? subcategorias.filter((subcategoria) => String(subcategoria.categoria_id) === String(campos.categoria))
    : subcategorias;

  useEffect(() => {
    if (open) {
      setExiting(false);
      setCampos(camposIniciales);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open]);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCategorias());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (campos.categoria) {
      console.log("Cargando subcategorías para categoría:", campos.categoria);
      dispatch(fetchSubcategorias(campos.categoria));
    }
  }, [campos.categoria, dispatch]);



  const handleClose = () => {
    setExiting(true);
    timeoutRef.current = setTimeout(() => {
      setExiting(false);
      onClose();
    }, 450);
  };

  const handleGuardarProducto = async () => {
  try {
    const formData = new FormData();
    formData.append('nombre', campos.nombre);
    formData.append('categoria_id', campos.categoria);
    formData.append('subcategoria_id', campos.subcategoria);
    formData.append('costo', campos.costo);
    formData.append('precio_venta', campos.precio_venta);
    formData.append('talle', campos.talle);
    formData.append('codigo', campos.sku);
    formData.append('color', campos.color);
    formData.append('marca', campos.marca);
    formData.append('stock_actual', campos.stock);
    formData.append('stock_minimo', campos.stock_minimo);
    formData.append('estado', campos.estado);
    formData.append('fecha_ingreso', campos.ingreso);
    formData.append('temporada', campos.temporada);

    // Solo si hay archivo seleccionado
    if (campos.imagen instanceof File) {
      formData.append('imagen', campos.imagen);
    }

    const response = await axios.post('/api/productos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    console.log('Producto guardado:', response.data);
    dispatch(fetchProductos());
    handleClose();
  } catch (error) {
    console.error('Error al guardar el producto:', error);
  }
};

  if (!open && !exiting) return null;

  return (
    <div className="modal-nuevo-backdrop" onClick={handleClose}>
      <div
        className={`modal-nuevo-container${exiting ? " modal-exit" : ""}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-nuevo-header">
          <span className="modal-nuevo-icon" role="img" aria-label="producto">📦</span>
          <span className="modal-nuevo-title">Nuevo Producto</span>
        </div>
        <div className="modal-nuevo-img-upload">
          <label className="modal-nuevo-img-placeholder" tabIndex={0}>
            {!campos.imagen && (
              <div className="modal-nuevo-img-overlay">
                <span>Para subir una imagen desde archivo,<br /> presione <span className="modal-nuevo-img-link">aquí</span></span>
              </div>
            )}
            {campos.imagen && campos.imagenPreview && (
              <img src={campos.imagenPreview} alt="Producto" className="modal-nuevo-img-preview" />
            )}
            <input
              id="modal-nuevo-img-input"
              type="file"
              accept="image/*"
              className="modal-nuevo-img-input"
              onChange={e => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setCampos({ ...campos, imagen: file, imagenPreview: reader.result });
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
        </div>
        <form className="modal-nuevo-form">
          <div className="modal-nuevo-row">
            <label>Nombre:</label>
            <input type="text" value={campos.nombre} onChange={e => setCampos({ ...campos, nombre: e.target.value })} />
            <label>Categoría:</label>
            <select value={campos.categoria} onChange={e => setCampos({ ...campos, categoria: e.target.value })}>
              <option value="">Seleccionar</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-nuevo-row">
            <label>Costo:</label>
            <input type="number" value={campos.costo} onChange={e => setCampos({ ...campos, costo: e.target.value })} />
            <label>Sub-Categoría:</label>
            <select value={campos.subcategoria} onChange={e => setCampos({ ...campos, subcategoria: e.target.value })}>
              <option value="">Seleccionar</option>
              {subcategoriasFiltradas.map((subcategoria) => (
                <option key={subcategoria.id} value={subcategoria.id}>
                  {subcategoria.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-nuevo-row">
            <label>Talle:</label>
            <input type="text" value={campos.talle} onChange={e => setCampos({ ...campos, talle: e.target.value })} placeholder="S,M,L,XL" />
            <label>Precio venta:</label>
            <input type="number" value={campos.precio_venta} onChange={e => setCampos({ ...campos, precio_venta: e.target.value })} />
          </div>
          <div className="modal-nuevo-row">
            <label>SKU:</label>
            <input type="text" value={campos.sku} onChange={e => setCampos({ ...campos, sku: e.target.value })} />
            <label>Marca:</label>
            <input type="text" value={campos.marca} onChange={e => setCampos({ ...campos, marca: e.target.value })} />
          </div>
          <div className="modal-nuevo-row">
            <label>Stock:</label>
            <input type="number" value={campos.stock} onChange={e => setCampos({ ...campos, stock: e.target.value })} />
            <label>Stock-Mínimo:</label>
            <input type="number" value={campos.stock_minimo} onChange={e => setCampos({ ...campos, stock_minimo: e.target.value })} />
          </div>
          <div className="modal-nuevo-row">
            <label>Color:</label>
            <input type="text" value={campos.color} onChange={e => setCampos({ ...campos, color: e.target.value })} />
            <label>Temporada:</label>
            <input type="text" value={campos.temporada} onChange={e => setCampos({ ...campos, temporada: e.target.value })} />
          </div>
          <div className="modal-nuevo-row">
            <label>Estado:</label>
            <select value={campos.estado} onChange={e => setCampos({ ...campos, estado: e.target.value })}>
              <option value="activa">Activa</option>
              <option value="sinStock">Sin Stock</option>
              <option value="inactiva">Inactiva</option>
            </select>
            <label>Ingreso:</label>
            <input type="date" value={campos.ingreso} onChange={e => setCampos({ ...campos, ingreso: e.target.value })} />
          </div>
        </form>
        <div className="modal-nuevo-actions">
          <BotonCancelar onClick={handleClose}>Cancelar</BotonCancelar>
          <BotonEnviar onClick={handleGuardarProducto}>Guardar producto</BotonEnviar>
        </div>
      </div>
    </div>
  );
};

export default ModalNuevoProducto;
