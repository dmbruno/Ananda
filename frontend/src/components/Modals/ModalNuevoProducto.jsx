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
  codigo: "", // Cambiado de "sku" a "codigo" para mantener consistencia con el backend
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
  
  // Obtener información del usuario desde Redux
  const user = useSelector(state => state.auth.user);
  // Verificar si el usuario es administrador
  const isAdmin = user && user.is_admin === true;
  
  // Modificar campos iniciales si el usuario no es administrador
  const initialCampos = {
    ...camposIniciales,
    costo: isAdmin ? "" : "0"  // Si no es admin, el costo inicial es "0"
  };
  
  const [campos, setCampos] = useState(initialCampos);
  const [skuBase, setSkuBase] = useState("");
  const [isGeneratingSku, setIsGeneratingSku] = useState(false);

  const subcategorias = useSelector((state) => selectSubcategoriasByCategoria(state, campos.categoria)); // Revertir al selector anterior

  // Filtrar dinámicamente las subcategorías según la categoría seleccionada
  const subcategoriasFiltradas = campos.categoria
    ? subcategorias.filter((subcategoria) => String(subcategoria.categoria_id) === String(campos.categoria))
    : subcategorias;

  useEffect(() => {
    if (open) {
      setExiting(false);
      setCampos({
        ...camposIniciales,
        costo: isAdmin ? "" : "0"  // Si no es admin, el costo se establece a "0"
      });
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open, isAdmin]);

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
  
  // Función para obtener la abreviatura de la categoría (3 letras)
  const getCategoriaCode = (categoriaId) => {
    const categoria = categorias.find(cat => String(cat.id) === String(categoriaId));
    if (!categoria) return "";
    return categoria.nombre.substring(0, 3).toUpperCase();
  };

  // Función para obtener la abreviatura de la subcategoría (2 letras)
  const getSubcategoriaCode = (subcategoriaId) => {
    const subcategoria = subcategorias.find(sub => String(sub.id) === String(subcategoriaId));
    if (!subcategoria) return "";
    return subcategoria.nombre.substring(0, 2).toUpperCase();
  };

  // Generación de la base del SKU según las reglas especificadas
  useEffect(() => {
    // Solo generar SKU si todos los campos requeridos están completos
    if (campos.categoria && campos.subcategoria && campos.nombre && campos.color && campos.talle) {
      // 1. Abreviatura de la categoría (3 letras)
      const catCode = getCategoriaCode(campos.categoria);
      
      // 2. Abreviatura de la subcategoría (2 letras)
      const subCode = getSubcategoriaCode(campos.subcategoria);
      
      // 3. Primeras 3 letras del nombre o modelo del producto
      const modelCode = campos.nombre.substring(0, 3).toUpperCase();
      
      // 4. Abreviatura del color (3 letras)
      const colorCode = campos.color.substring(0, 3).toUpperCase();
      
      // 5. Talle tal cual se seleccione
      const talleCode = campos.talle.toUpperCase();
      
      // Generar base del SKU
      const newSkuBase = catCode + subCode + modelCode + colorCode + talleCode;
      setSkuBase(newSkuBase);
      
      // 6. Buscar el último SKU y obtener número secuencial
      if (catCode && subCode && modelCode && colorCode && talleCode && !isGeneratingSku) {
        setIsGeneratingSku(true);
        obtenerSecuencialSKU(newSkuBase);
      }
    }
  }, [campos.categoria, campos.subcategoria, campos.nombre, campos.color, campos.talle, categorias, subcategorias]);

  // Función para obtener el número secuencial del SKU
  const obtenerSecuencialSKU = async (base) => {
    try {
      console.log("Obteniendo secuencial para base:", base);
      
      // Llamada a la API para buscar el último SKU que coincida con la base
      const response = await axios.get(`/api/productos/ultimo-sku?base=${base}`);
      const ultimoNumero = response.data.ultimoNumero || 0;
      const nuevoNumero = String(ultimoNumero + 1).padStart(3, "0");
      const nuevoSku = base + nuevoNumero;
      
      console.log(`SKU generado: ${nuevoSku} (último número: ${ultimoNumero}, nuevo: ${nuevoNumero})`);
      
      // El campo en el backend es "codigo", pero en el frontend lo manejamos como "sku"
      setCampos(prev => ({ ...prev, codigo: nuevoSku }));
    } catch (error) {
      console.error("Error al obtener el último SKU:", error);
      // En caso de error, usar 001 como secuencial predeterminado
      const nuevoSku = base + "001";
      console.log(`Error generando SKU, usando predeterminado: ${nuevoSku}`);
      setCampos(prev => ({ ...prev, codigo: nuevoSku }));
    } finally {
      setIsGeneratingSku(false);
    }
  };



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
    // Si no es admin, forzar el costo a "0" por seguridad
    formData.append('costo', isAdmin ? campos.costo : "0");
    formData.append('precio_venta', campos.precio_venta);
    formData.append('talle', campos.talle);
    formData.append('color', campos.color);
    formData.append('codigo', campos.codigo); // Cambiado de campos.sku a campos.codigo
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
            <input 
              type="number" 
              value={campos.costo} 
              onChange={e => isAdmin ? setCampos({ ...campos, costo: e.target.value }) : null}
              disabled={!isAdmin}
              style={!isAdmin ? {
                backgroundColor: "#f5f5f5", 
                cursor: "not-allowed",
                opacity: "0.7"
              } : {}}
              placeholder={!isAdmin ? "Solo disponible para administradores" : ""}
            />
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
            <label>Marca:</label>
            <input type="text" value={campos.marca} onChange={e => setCampos({ ...campos, marca: e.target.value })} />
            <label>Estado:</label>
            <select value={campos.estado} onChange={e => setCampos({ ...campos, estado: e.target.value })}>
              <option value="activa">Activa</option>
              <option value="sinStock">Sin Stock</option>
              <option value="inactiva">Inactiva</option>
            </select>
          </div>
          <div className="modal-nuevo-row">
            <label>Ingreso:</label>
            <input type="date" value={campos.ingreso} onChange={e => setCampos({ ...campos, ingreso: e.target.value })} />
            <label>SKU:</label>
            <input 
              type="text" 
              value={campos.codigo || ""} 
              readOnly 
              placeholder={isGeneratingSku ? "Generando SKU..." : "Se generará automáticamente"}
              style={{ 
                backgroundColor: "#f5f5f5", 
                cursor: "not-allowed",
                color: "#000000",
                fontWeight: "700",
                letterSpacing: "1.5px"
              }}
            />
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
