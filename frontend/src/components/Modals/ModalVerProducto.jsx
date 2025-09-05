import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { actualizarProducto } from "../../api/productos";
import { agregarAlCarrito } from "../../store/carritoSlice";
import "./ModalVerProducto.css";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonEnviar from "../Botones/BotonEnviar";
import BotonEditar from "../Botones/BotonEditar";
import notify from '../../utils/notify';
import { useConfirm } from '../../utils/confirm/ConfirmContext';

// Definir campos inmutables (que afectan al SKU) y editables
const CAMPOS_INMUTABLES = ['categoria', 'subcategoria', 'nombre', 'talle', 'color', 'codigo'];
const CAMPOS_EDITABLES = ['costo', 'precio_venta', 'stock_actual', 'stock_minimo', 'marca', 'temporada', 'fecha_ingreso', 'activo'];

const ModalVerProducto = ({ producto, onClose, onProductoActualizado }) => {
  const dispatch = useDispatch();
  const carrito = useSelector(state => state.carrito);
  
  // Obtener información del usuario desde Redux
  const user = useSelector(state => state.auth.user);
  // Verificar si el usuario es administrador
  const isAdmin = user && user.is_admin === true;
  
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosProducto, setDatosProducto] = useState(producto);
  const [agregandoCarrito, setAgregandoCarrito] = useState(false);
  const confirm = useConfirm();

  // Obtener la cantidad del producto en el carrito
  const productoEnCarrito = carrito.items.find(item => item.id === datosProducto.id);
  const cantidadEnCarrito = productoEnCarrito ? productoEnCarrito.cantidad : 0;
  const stockDisponible = datosProducto.stock_actual - cantidadEnCarrito;

  // Función para verificar si un campo es editable
  const esCampoEditable = (campo) => {
    // Si el campo es "costo" y el usuario no es admin, no es editable
    if (campo === 'costo' && !isAdmin) return false;
    return CAMPOS_EDITABLES.includes(campo);
  };

  // Sincroniza datosProducto con producto actualizado
  useEffect(() => {
    setDatosProducto(producto);
  }, [producto]);
  const [cerrando, setCerrando] = useState(false);

  const handleEditar = () => {
    setModoEdicion(true);
  };

  const handleGuardar = async () => {
    try {
      const res = await actualizarProducto(datosProducto.id, datosProducto);
      let productoActualizado = { ...datosProducto };
      if (res.imagen_url) {
        productoActualizado = {
          ...productoActualizado,
          imagen_url: res.imagen_url + '?t=' + Date.now(),
          imagen: undefined,
          imagenPreview: undefined
        };
      }
      setModoEdicion(false);
      if (onProductoActualizado) {
        onProductoActualizado(productoActualizado);
      }
      // Confirmación y refresco local
      const ok = await confirm("Cambios guardados. ¿Desea ver el producto actualizado?");
      if (!ok) {
        notify.info('No se mostró el producto actualizado');
      } else {
        setDatosProducto(productoActualizado);
      }
    } catch (err) {
      notify.error("Error al guardar cambios: " + err.message, { autoClose: 5000 });
    }
  };

  const handleCancelarEdicion = () => {
    setModoEdicion(false);
    setDatosProducto(producto);
  };

  const handleClose = () => {
    setCerrando(true);
    setTimeout(() => {
      onClose();
    }, 450); // Duración igual a la animación CSS
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Solo permitir cambios en campos editables
    if (esCampoEditable(name)) {
      setDatosProducto({ ...datosProducto, [name]: value });
    } else {
      console.warn(`Campo ${name} no es editable - afecta al código SKU`);
    }
  };

  const handleImagenChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setDatosProducto(prev => ({
        ...prev,
        imagen: file,
        imagenPreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  }
};

  const handleAgregarAlCarrito = () => {
    if (!datosProducto.activo) {
      notify.warn('Este producto está inactivo y no se puede agregar al carrito');
      return;
    }

    // Evitar doble click durante la animación
    if (agregandoCarrito) return;

    // Iniciar animación
    setAgregandoCarrito(true);

    // Preparar el item para el carrito
    const itemCarrito = {
      id: datosProducto.id,
      nombre: datosProducto.nombre,
      precio: datosProducto.precio_venta,
      cantidad: 1,
      stock: datosProducto.stock_actual,
      imagen: datosProducto.imagen_url || null,
      categoria: datosProducto.categoria_nombre || '',
      subcategoria: datosProducto.subcategoria_nombre || '',
      codigo: datosProducto.codigo || '',
      talle: datosProducto.talle || '',
      color: datosProducto.color || '',
      marca: datosProducto.marca || ''
    };

    console.log('🛒 Agregando producto al carrito desde modal:', itemCarrito);
    dispatch(agregarAlCarrito(itemCarrito));

    // Finalizar animación después de 1 segundo
    setTimeout(() => {
      setAgregandoCarrito(false);
    }, 1000);
  };

  return (
    <div className="modal-ver-backdrop" onClick={handleClose}>
      <div
        className={`modal-ver-producto${cerrando ? " modal-exit" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`modal-header-producto${!modoEdicion ? " ver" : ""}`}>
          <div className="header-left">
            <div className="circle-id">
              {String(datosProducto.id).padStart(3, "0")}
            </div>
            <div className="header-main-info">
              <div className="nombre-producto">
                {modoEdicion ? (
                  <div className="campo-inmutable">
                    <input
                      type="text"
                      name="nombre"
                      value={datosProducto.nombre || ""}
                      readOnly
                      className="input-inmutable input-header"
                      placeholder="Nombre"
                      title="No editable - afecta al código SKU"
                    />
                    <span className="inmutable-icon">🔒</span>
                  </div>
                ) : (
                  datosProducto.nombre
                )}
              </div>
              <div className="sku-producto">
                {modoEdicion ? (
                  <div className="campo-inmutable">
                    <input
                      type="text"
                      name="codigo"
                      value={datosProducto.codigo || ""}
                      readOnly
                      className="input-inmutable input-header"
                      placeholder="SKU"
                      title="Código inmutable para mantener trazabilidad"
                    />
                    <span className="inmutable-icon">🔒</span>
                  </div>
                ) : (
                  datosProducto.codigo
                )}
              </div>
            </div>
          </div>
          <div className="header-right">
            <div className="categoria-producto">
              {datosProducto.categoria_nombre}
            </div>
            <div className="subcategoria-producto">
              {datosProducto.subcategoria_nombre}
            </div>
            <div className="marca-producto">
              {modoEdicion ? (
                <input
                  type="text"
                  name="marca"
                  value={datosProducto.marca || ""}
                  onChange={handleChange}
                  className="input-editar input-header"
                  placeholder="Marca"
                />
              ) : (
                datosProducto.marca
              )}
            </div>
            <div className="temporada-producto">
              {modoEdicion ? (
                <input
                  type="text"
                  name="temporada"
                  value={datosProducto.temporada || ""}
                  onChange={handleChange}
                  className="input-editar input-header"
                  placeholder="Temporada"
                />
              ) : (
                datosProducto.temporada
              )}
            </div>
          </div>
        </div>
        <div className="modal-body">
          <div className={`contenedor-imagen-producto${modoEdicion ? " edicion" : ""}`}>
            <div className="producto-imagen">
              {modoEdicion ? (
                <label className="modal-nuevo-img-placeholder" tabIndex={0}>
                  {(datosProducto.imagenPreview || datosProducto.imagen_url) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <img
                        src={datosProducto.imagenPreview || datosProducto.imagen_url}
                        alt={datosProducto.nombre}
                        className="modal-nuevo-img-preview img-edicion-chica"
                        style={{ width: '50%', maxWidth: '120px', minWidth: '80px', height: 'auto', borderRadius: '12px' }}
                      />
                      <span style={{ fontSize: '1rem', color: '#888', fontWeight: 500 }}>
                        Para actualizar la imagen, presione <span className="modal-nuevo-img-link">aquí</span>
                      </span>
                    </div>
                  ) : (
                    <div className="modal-nuevo-img-overlay">
                      <span>
                        Para subir una imagen desde archivo,<br />
                        presione <span className="modal-nuevo-img-link">aquí</span>
                      </span>
                    </div>
                  )}
                  <input
                    id="modal-nuevo-img-input"
                    type="file"
                    accept="image/*"
                    className="modal-nuevo-img-input"
                    style={{ display: "none" }}
                    onChange={handleImagenChange}
                  />
                </label>
              ) : datosProducto.imagen_url ? (
                <img 
                  src={datosProducto.imagen_url} 
                  alt={datosProducto.nombre} 
                  style={{ cursor: 'zoom-in' }}
                  onClick={() => setPreviewOpen(true)}
                  title="Ver imagen grande"
                />
              ) : (
                <div className="no-imagen-placeholder">
                  No hay imagen para mostrar
                </div>
              )}
            </div>
          </div>

          {/* Overlay de vista previa de imagen grande */}
          {previewOpen && datosProducto.imagen_url && (
            <div 
              className="modal-imagen-preview-overlay" 
              onClick={() => setPreviewOpen(false)}
            >
              <img 
                src={datosProducto.imagen_url} 
                alt={datosProducto.nombre}
                className="modal-imagen-preview-img"
                onClick={e => e.stopPropagation()}
              />
            </div>
          )}
          <div className="modal-divider" />
          <div className="producto-detalles-grid2">
            <div className="detalle-row">
              <span className="detalle-label">Costo:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  isAdmin ? (
                    <input
                      type="number"
                      name="costo"
                      value={datosProducto.costo}
                      onChange={handleChange}
                      className="input-editar"
                    />
                  ) : (
                    <div className="campo-inmutable">
                      <input
                        type="number"
                        name="costo"
                        value={datosProducto.costo}
                        readOnly
                        className="input-inmutable blur-content"
                        title="Solo visible para administradores"
                      />
                      <span className="inmutable-icon">🔒</span>
                    </div>
                  )
                ) : (
                  <span className={!isAdmin ? "blur-content" : ""}>
                    ${datosProducto.costo}
                  </span>
                )}
              </span>
            </div>
            <div className="detalle-row">
              <span className="detalle-label">Talle:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  <div className="campo-inmutable">
                    <input
                      type="text"
                      name="talle"
                      value={datosProducto.talle || ""}
                      readOnly
                      className="input-inmutable"
                      title="No editable - afecta al código SKU"
                    />
                    <span className="inmutable-icon">🔒</span>
                  </div>
                ) : (
                  datosProducto.talle
                )}
              </span>
            </div>
            <div className="detalle-row">
              <span className="detalle-label">Precio venta:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  <input
                    type="number"
                    name="precio_venta"
                    value={datosProducto.precio_venta}
                    onChange={handleChange}
                    className="input-editar"
                  />
                ) : (
                  `$${datosProducto.precio_venta}`
                )}
              </span>
            </div>
            <div className="detalle-row">
              <span className="detalle-label">Ingreso:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  <input
                    type="date"
                    name="fecha_ingreso"
                    value={datosProducto.fecha_ingreso || ""}
                    onChange={handleChange}
                    className="input-editar"
                  />
                ) : (
                  datosProducto.fecha_ingreso
                )}
              </span>
            </div>
            <div className="detalle-row">
              <span className="detalle-label">Stock:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  <input
                    type="number"
                    name="stock_actual"
                    value={datosProducto.stock_actual}
                    onChange={handleChange}
                    className="input-editar"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{datosProducto.stock_actual}</span>
                    {cantidadEnCarrito > 0 && (
                      <span style={{ 
                        fontSize: '0.85em', 
                        color: '#666', 
                        fontStyle: 'italic' 
                      }}>
                        ({cantidadEnCarrito} en carrito)
                      </span>
                    )}
                  </div>
                )}
              </span>
            </div>
            <div className="detalle-row">
              <span className="detalle-label">Estado:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  <select
                    name="activo"
                    value={datosProducto.activo ? "Activo" : "Inactivo"}
                    onChange={(e) =>
                      setDatosProducto({
                        ...datosProducto,
                        activo: e.target.value === "Activo",
                      })
                    }
                    className="input-editar"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                ) : datosProducto.activo ? (
                  "Activo"
                ) : (
                  "Inactivo"
                )}
              </span>
            </div>
            <div className="detalle-row">
              <span className="detalle-label">Stock-Mínimo:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  <input
                    type="number"
                    name="stock_minimo"
                    value={datosProducto.stock_minimo}
                    onChange={handleChange}
                    className="input-editar"
                  />
                ) : (
                  datosProducto.stock_minimo
                )}
              </span>
            </div>
            <div className="detalle-row">
              <span className="detalle-label">Color:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  <div className="campo-inmutable">
                    <input
                      type="text"
                      name="color"
                      value={datosProducto.color || ""}
                      readOnly
                      className="input-inmutable"
                      title="No editable - afecta al código SKU"
                    />
                    <span className="inmutable-icon">🔒</span>
                  </div>
                ) : (
                  datosProducto.color
                )}
              </span>
            </div>
          </div>
        </div>
        
        {/* Panel informativo para campos inmutables */}
        {modoEdicion && (
          <div className="panel-inmutables-info">
            <div className="info-header">
              <span className="info-icon">ℹ️</span>
              <span className="info-title">Campos protegidos</span>
            </div>
            <p className="info-text">
              Los campos con <span className="inmutable-icon">🔒</span> no se pueden editar porque afectan al código SKU.
              Si necesita cambiar estos datos, elimine el producto y créelo nuevamente.
            </p>
          </div>
        )}
        
        <div className="modal-footer-producto">
          <div className="modal-footer-producto-row">
            {!modoEdicion && (
              <>
                <BotonCancelar onClick={handleClose}>Atrás</BotonCancelar>
                <BotonEnviar 
                  onClick={handleAgregarAlCarrito}
                  className={agregandoCarrito ? 'agregando-carrito' : ''}
                  disabled={agregandoCarrito || stockDisponible <= 0 || !datosProducto.activo}
                >
                  {!datosProducto.activo 
                    ? 'Producto inactivo'
                    : stockDisponible <= 0 
                    ? (cantidadEnCarrito > 0 ? 'Máximo alcanzado' : 'Sin stock')
                    : agregandoCarrito 
                    ? '✓ Agregado!' 
                    : cantidadEnCarrito > 0
                    ? `+1 (${cantidadEnCarrito} en carrito)`
                    : 'Agregar al carrito'
                  }
                </BotonEnviar>
                <BotonEditar onClick={handleEditar}>
                  Editar Producto
                </BotonEditar>
              </>
            )}
            {modoEdicion && (
              <>
                <BotonCancelar onClick={handleCancelarEdicion}>
                  Cancelar edición
                </BotonCancelar>
                <BotonEnviar onClick={handleGuardar}>
                  Guardar cambios
                </BotonEnviar>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalVerProducto;
