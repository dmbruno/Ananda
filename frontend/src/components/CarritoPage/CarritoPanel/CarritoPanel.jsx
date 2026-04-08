import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setPaso,
  setDescuento,
  setTipoDescuento,
  setMetodoPago,
  procesarVenta,
  reiniciarVenta,
} from "../../../store/ventaProcesoSlice";
import { fetchProductos } from "../../../store/productosSlice";
import { vaciarCarrito } from "../../../store/carritoSlice";
import { obtenerCajaActual } from "../../../store/cajaSlice";
import BuscadorProducto from "./BuscadorProducto";
import ProductoItem from "./ProductoItem";
import ResumenVenta from "./ResumenVenta";
import "./CarritoPanel.css";
import notify from '../../../utils/notify';
import { fetchVentas } from '../../../store/ventasSlice';

export default function CarritoPanel() {
  const dispatch = useDispatch();
  const {
    cliente,
    paso,
    descuento,
    metodoPago,
    procesando,
    error,
    ventaExitosa,
  } = useSelector((state) => state.ventaProceso);
  const { items = [] } = useSelector((state) => state.carrito);
  const { items: productos = [] } = useSelector((state) => state.productos);

  const [busquedaProducto, setBusquedaProducto] = useState("");

  useEffect(() => {
    // Cargar productos si no están cargados
    if (productos.length === 0) {
      dispatch(fetchProductos());
    }
  }, [dispatch, productos.length]);

  const handleVolver = () => {
    dispatch(setPaso(1));
  };

  const handleContinuar = async () => {
    if (paso === 2 && items.length > 0) {
      // Ir al paso 3 (resumen final)
      dispatch(setPaso(3));
    } else if (paso === 3) {
      // Procesar la venta completa
      await handleProcesarVenta();
    }
  };

  const handleProcesarVenta = async () => {
    try {
      // Validaciones previas
      if (!cliente) {
        notify.warn("Debe seleccionar un cliente");
        return;
      }

      if (items.length === 0) {
        notify.warn("Debe agregar al menos un producto");
        return;
      }

      if (!metodoPago) {
        notify.warn("Debe seleccionar un método de pago");
        return;
      }

      // Calcular totales
      const subtotal = items.reduce(
        (sum, item) => sum + item.precio * item.cantidad,
        0
      );
      let montoDescuento = 0;
      if (descuento.tipo === 'porcentaje') {
        montoDescuento = (subtotal * descuento.valor) / 100;
      } else {
        montoDescuento = Math.min(descuento.valor, subtotal);
      }
      const totalFinal = subtotal - montoDescuento;

      // Preparar datos de la venta
      const ventaData = {
        items: items,
        total: totalFinal,
      };

      // Procesar venta

      const resultado = await dispatch(procesarVenta(ventaData)).unwrap();

      // Si todo salió bien, limpiar carrito y actualizar caja
      dispatch(vaciarCarrito());
      dispatch(obtenerCajaActual());
      // Refrescar productos para que las páginas de stock muestren el stock actualizado sin recargar
      dispatch(fetchProductos());
      // Refrescar ventas para que la tabla histórica muestre la nueva venta inmediatamente
      dispatch(fetchVentas());

      // Mostrar mensaje de éxito
      const mensaje = `Número de venta: ${resultado.venta.id}\nTotal: $${totalFinal.toLocaleString("es-AR")}`;
      notify.success(`¡Venta procesada exitosamente! \n${mensaje}`);

      // Reiniciar proceso después de 2 segundos
      setTimeout(() => {
        dispatch(reiniciarVenta());
      }, 2000);
    } catch (error) {
      console.error("🔥 Error en handleProcesarVenta:", error);
      notify.error(`Error al procesar la venta: ${error}`, { autoClose: 6000 });
    }
  };

  const handleNuevaVenta = () => {
    dispatch(reiniciarVenta());
    dispatch(vaciarCarrito());
  };

  const handleDescuentoChange = (nuevoDescuento) => {
    dispatch(setDescuento(nuevoDescuento));
  };

  const handleTipoDescuentoChange = (tipo) => {
    dispatch(setTipoDescuento(tipo));
  };

  const handleMetodoPagoChange = (nuevoMetodo) => {
    dispatch(setMetodoPago(nuevoMetodo));
  };

  const puedeAvanzar = items.length > 0;

  return (
    <div className="carrito-panel">
      <div className="carrito-panel-header">
        <h2 className="carrito-panel-title">🛒 Carrito de Compras</h2>
        <div className="carrito-panel-pasos">
          {paso === 2 && (
            <span className="carrito-panel-step-badge carrito-panel-step-current">
              Paso 2
            </span>
          )}
          {paso === 3 && (
            <span className="carrito-panel-step-badge carrito-panel-step-completed">
              ✓ Completado
            </span>
          )}
        </div>
      </div>

      <div className="carrito-panel-content">
        {/* Solo mostrar si hay un cliente seleccionado */}
        {!cliente ? (
          <div className="carrito-panel-sin-cliente">
            <div className="carrito-panel-sin-cliente-icono">👤</div>
            <h3>Selecciona un cliente primero</h3>
            <p>
              Para agregar productos al carrito, primero debes seleccionar un
              cliente en el panel izquierdo.
            </p>
          </div>
        ) : (
          <div className="carrito-panel-layout">
            {/* Sección superior: Buscador */}
            <div className="carrito-panel-buscador-seccion">
              <BuscadorProducto
                productos={productos}
                busqueda={busquedaProducto}
                onBusquedaChange={setBusquedaProducto}
              />
            </div>

            {/* Sección principal: Lista de productos + Resumen */}
            <div className="carrito-panel-main-content">
              {/* Lista de productos en el carrito */}
              <div className="carrito-panel-items-seccion">
                <div className="carrito-panel-items-header">
                  <h3 className="carrito-panel-seccion-titulo">
                    🛒 Productos en el Carrito ({items.length})
                  </h3>
                </div>

                <div className="carrito-panel-items-container">
                  {items.length === 0 ? (
                    <div className="carrito-panel-vacio">
                      <div className="carrito-panel-vacio-icono">🛒</div>
                      <p>El carrito está vacío</p>
                      <span>
                        Busca y agrega productos usando el buscador de arriba
                      </span>
                    </div>
                  ) : (
                    <div className="carrito-panel-lista">
                      {items.map((item) => (
                        <ProductoItem key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Resumen de la venta - solo si hay productos */}
              {items.length > 0 && (
                <div className="carrito-panel-resumen-seccion">
                  <ResumenVenta
                    items={items}
                    descuento={descuento}
                    metodoPago={metodoPago}
                    onDescuentoChange={handleDescuentoChange}
                    onTipoDescuentoChange={handleTipoDescuentoChange}
                    onMetodoPagoChange={handleMetodoPagoChange}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer con navegación */}
      {cliente && (
        <div className="carrito-panel-footer">
          <div className="carrito-panel-navegacion">
            <button className="carrito-panel-btn-volver" onClick={handleVolver}>
              ← Volver al Cliente
            </button>

            <button
              className={`carrito-panel-btn-continuar ${
                !puedeAvanzar || procesando
                  ? "carrito-panel-btn-deshabilitado"
                  : ventaExitosa
                  ? "carrito-panel-btn-exito"
                  : ""
              }`}
              onClick={ventaExitosa ? handleNuevaVenta : handleContinuar}
              disabled={!puedeAvanzar || procesando}
            >
              <span className="carrito-panel-boton-icono">
                {procesando ? "⏳" : ventaExitosa ? "✅" : "💰"}
              </span>
              {procesando
                ? "Procesando..."
                : ventaExitosa
                ? "Nueva Venta"
                : paso === 3
                ? "Procesar Venta"
                : "Finalizar Venta →"}
            </button>
          </div>

          {!puedeAvanzar && !ventaExitosa && (
            <div className="carrito-panel-mensaje-ayuda">
              Agrega al menos un producto para continuar
            </div>
          )}

          {error && (
            <div className="carrito-panel-mensaje-error">❌ {error}</div>
          )}

          {ventaExitosa && (
            <div className="carrito-panel-mensaje-exito">
              ✅ ¡Venta procesada exitosamente! ID: {ventaExitosa.venta?.id}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
