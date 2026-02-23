import React, { useState, useEffect } from "react";
import { getDetallesVenta } from "../../api/ventas";
import "./ModalVerVenta.css";
import BotonCancelar from "../Botones/BotonCancelar";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import notify from '../../utils/notify';
import ModalCambioPrenda from "../Cambios/ModalCambioPrenda";

const ModalVerVenta = ({ venta, onClose }) => {
  const [detalles, setDetalles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cerrando, setCerrando] = useState(false);
  const [detalleParaCambio, setDetalleParaCambio] = useState(null);
  const [ventaActualizada, setVentaActualizada] = useState(venta);

  const handleClose = () => {
    // Si estamos en modo cambio, primero cerramos el modal de cambio
    if (detalleParaCambio) {
      setDetalleParaCambio(null);
      return;
    }
    setCerrando(true);
    setTimeout(() => {
      onClose(ventaActualizada);
    }, 450);
  };

  const handleAbrirCambio = (detalle) => {
    setDetalleParaCambio(detalle);
  };

  const recargarDatosVenta = async () => {
    try {
      setLoading(true);
      if (!ventaActualizada || !ventaActualizada.id || isNaN(Number(ventaActualizada.id))) {
        console.error("ID de venta inválido:", ventaActualizada?.id);
        setLoading(false);
        return;
      }
      const detallesVenta = await getDetallesVenta(ventaActualizada.id);
      setDetalles(detallesVenta || []);
      // Si el backend devuelve total actualizado en los detalles, podrías actualizar ventaActualizada aquí si hace falta
    } catch (error) {
      console.error("Error al recargar datos de venta:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVentaActualizada(venta);
  }, [venta]);

  useEffect(() => {
    if (ventaActualizada && ventaActualizada.id) {
      recargarDatosVenta();
    }
  }, [ventaActualizada]);

  // Función para formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "-";
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Función para formatear métodos de pago
  const formatearMetodoPago = (metodo) => {
    const metodoPagoLabel = {
      "TC": "Tarjeta",
      "TB": "Transferencia",
      "EF": "Efectivo",
      "FT": "Efectivo"
    };
    return metodoPagoLabel[metodo] || metodo || "-";
  };

  // Calcular total
  const calcularTotal = () => {
    if (!detalles || detalles.length === 0) return 0;
    return detalles.reduce((total, detalle) => total + (detalle.subtotal || 0), 0);
  };
  
  // Función para generar PDF del comprobante
  const generarPDF = async (venta, detalles) => {
    try {
      const elemento = document.querySelector(".modal-container-venta");
      if (!elemento) return;
      
      // Notificar al usuario que se está generando el PDF
      const notificacion = document.createElement("div");
      notificacion.textContent = "Generando PDF...";
      notificacion.style.position = "absolute";
      notificacion.style.top = "50%";
      notificacion.style.left = "50%";
      notificacion.style.transform = "translate(-50%, -50%)";
      notificacion.style.background = "rgba(0,0,0,0.7)";
      notificacion.style.color = "white";
      notificacion.style.padding = "10px 20px";
      notificacion.style.borderRadius = "5px";
      notificacion.style.zIndex = "2000";
      document.body.appendChild(notificacion);
      
      // Capturar el contenido
      const canvas = await html2canvas(elemento, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true
      });
      
      // Crear PDF con dimensiones adecuadas
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      // Ajustar la imagen al tamaño del PDF manteniendo proporción
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Comprobante-Venta-${venta.id}.pdf`);
      
      // Eliminar la notificación
      document.body.removeChild(notificacion);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      notify.error("Ocurrió un error al generar el PDF");
    }
  };

  return (
    <>
      {/* Si hay un detalle para cambio, mostramos SOLO el modal de cambio */}
      {detalleParaCambio ? (
        <ModalCambioPrenda
          isOpen={!!detalleParaCambio}
          onClose={async () => {
            setDetalleParaCambio(null);
            await recargarDatosVenta();
          }}
          ventaId={ventaActualizada.id}
          detalleId={detalleParaCambio.id}
          productoOriginal={{
            id: detalleParaCambio.producto_id,
            nombre: detalleParaCambio.producto_nombre,
            talle: detalleParaCambio.talle,
            precio_venta: detalleParaCambio.precio_unitario,
          }}
          clienteInicial={{
            id: ventaActualizada.cliente_id,
            nombre: ventaActualizada.cliente_nombre,
          }}
        />
      ) : (
        <>
          <div className={`modal-overlay ${cerrando ? "cerrando" : ""}`}>
            <div className={`modal-container-venta ${cerrando ? "slide-out" : "slide-in"}`}>
              <div className="modal-header-venta">
               
                <button className="modal-close-btn" onClick={handleClose}>
                  ×
                </button>
                <div className="venta-title">
                  <h2>Venta #{venta.id}</h2>
                  <div className="venta-fecha">
                    {venta.fecha_venta ? formatearFecha(venta.fecha_venta) : "-"}
                  </div>
                </div>
              </div>

              <div className="modal-content-venta">
                <div className="cliente-section">
                  <h3>Cliente</h3>
                  <div className="cliente-info">
                    <div className="cliente-nombre">
                      <i className="fas fa-user"></i> {venta.cliente_nombre || "-"}
                    </div>
                    <div className="cliente-telefono">
                      <i className="fas fa-phone"></i> {venta.cliente_telefono || "-"}
                    </div>
                  </div>
                </div>

                <div className="productos-section">
                  <h3>Producto/s</h3>
                  {loading ? (
                    <p>Cargando detalles...</p>
                  ) : (
                    <>
                      <div className="productos-table">
                        <div className="productos-table-header">
                          <span>Producto</span>
                          <span>Talle</span>
                          <span>Cant.</span>
                          <span>Precio</span>
                        </div>
                        {detalles.length > 0 ? (
                          detalles.map((detalle) => (
                            <div className="productos-table-row" key={detalle.id}>
                              <span>{detalle.producto_nombre || `Producto #${detalle.producto_id}`}</span>
                              <span>{detalle.talle || "-"}</span>
                              <span>{detalle.cantidad}</span>
                              <span>${detalle.precio_unitario?.toLocaleString("es-AR") || "0"}</span>
                              <button
                                type="button"
                                className="productos-cambiar-btn"
                                onClick={() => handleAbrirCambio(detalle)}
                              >
                                Cambiar
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="productos-table-row">
                            <span>No se encontraron detalles</span>
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        )}
                      </div>
                      
                      <div className="resumen-venta">
                        <div className="subtotal-section">
                          <span className="subtotal-label">Subtotal</span>
                          <span className="subtotal-value">${detalles.length > 0 ? calcularTotal().toLocaleString("es-AR") : "0"}</span>
                        </div>
                        
                        <div className="descuento-section">
                          <span className="descuento-label">Descuento</span>
                          <span className="descuento-value">{venta.descuento ? `${venta.descuento}%` : "0%"}</span>
                        </div>
                        
                        <div className="metodo-pago-section">
                          <span className="metodo-pago-label">Método de pago</span>
                          <span className="metodo-pago-value">{formatearMetodoPago(venta.metodo_pago) || "-"}</span>
                        </div>
                        
                        <div className="total-section">
                          <span className="total-label">Total</span>
                          <span className="total-value">${venta.total ? venta.total.toLocaleString("es-AR") : "0"}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="nota-comprobante">
                  Comprobante no válido como factura
                </div>
              </div>

              <div className="modal-footer-venta">
                <BotonCancelar onClick={handleClose}>
                  <i className="fa-arrow-left"></i> Atrás
                </BotonCancelar>
                 <button className="modal-download-btn" onClick={() => generarPDF(venta, detalles)}>
                  <i className="fas fa-download"></i>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ModalVerVenta;
