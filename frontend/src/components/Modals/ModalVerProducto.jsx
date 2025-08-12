
import React, { useState, useEffect } from "react";
import { actualizarProducto } from "../../api/productos";
import "./ModalVerProducto.css";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonEnviar from "../Botones/BotonEnviar";
import BotonEditar from "../Botones/BotonEditar";

const ModalVerProducto = ({ producto, onClose, onProductoActualizado }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [datosProducto, setDatosProducto] = useState(producto);

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
      if (window.confirm("Cambios guardados. ¿Desea ver el producto actualizado?")) {
        setDatosProducto(productoActualizado);
      }
    } catch (err) {
      alert("Error al guardar cambios: " + err.message);
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
    setDatosProducto({ ...datosProducto, [name]: value });
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
                  <input
                    type="text"
                    name="nombre"
                    value={datosProducto.nombre || ""}
                    onChange={handleChange}
                    className="input-editar input-header"
                    placeholder="Nombre"
                  />
                ) : (
                  datosProducto.nombre
                )}
              </div>
              <div className="sku-producto">
                {modoEdicion ? (
                  <input
                    type="text"
                    name="codigo"
                    value={datosProducto.codigo || ""}
                    onChange={handleChange}
                    className="input-editar input-header"
                    placeholder="SKU"
                  />
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
                  <input
                    type="number"
                    name="costo"
                    value={datosProducto.costo}
                    onChange={handleChange}
                    className="input-editar"
                  />
                ) : (
                  `$${datosProducto.costo}`
                )}
              </span>
            </div>
            <div className="detalle-row">
              <span className="detalle-label">Talle:</span>
              <span className="detalle-value">
                {modoEdicion ? (
                  <input
                    type="text"
                    name="talle"
                    value={datosProducto.talle || ""}
                    onChange={handleChange}
                    className="input-editar"
                  />
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
                  datosProducto.stock_actual
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
                  <input
                    type="text"
                    name="color"
                    value={datosProducto.color || ""}
                    onChange={handleChange}
                    className="input-editar"
                  />
                ) : (
                  datosProducto.color
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="modal-footer-producto">
          <div className="modal-footer-producto-row">
            {!modoEdicion && (
              <>
                <BotonCancelar onClick={handleClose}>Atrás</BotonCancelar>
                <BotonEnviar onClick={() => {}}>Agregar al carrito</BotonEnviar>
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
