import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { eliminarVenta } from "../../store/ventasSlice";
import { fetchVentas } from "../../store/ventasSlice";
import { fetchProductos } from "../../store/productosSlice";
import { obtenerCajaActual } from "../../store/cajaSlice";
import ModalVerVenta from "../Modals/ModalVerVenta";
import { useConfirm } from '../../utils/confirm/ConfirmContext';
import notify from '../../utils/notify';
import "./VentasHistoricasTable.css";

const VentasHistoricasTable = ({ ventasFiltradas = [], onVerDetalle }) => {
  // Estado para el modal
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Hook de Redux
  const dispatch = useDispatch();
  const confirm = useConfirm();

  // Usar las ventas filtradas directamente
  const ventas = ventasFiltradas;
  
  // Formatear fecha (YYYY-MM-DD a DD/MM)
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const fecha = new Date(fechaStr);
    return `${fecha.getDate().toString().padStart(2, '0')}/${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Las ventas ya vienen correctamente procesadas desde el componente padre
  const ventasParaMostrar = ventasFiltradas;

  // Función para abrir el modal
  const handleVerVenta = (venta) => {
    setVentaSeleccionada(venta);
    setModalVisible(true);
  };

  // Función para cerrar el modal
  const handleCerrarModal = () => {
    setModalVisible(false);
    setVentaSeleccionada(null);
  };

  // Función para eliminar venta con confirmación
  const handleEliminarVenta = async (venta, e) => {
    e.stopPropagation(); // Evitar que se abra el modal
    
    try {
      const confirmar = await confirm(
        `¿Estás seguro de que deseas eliminar la venta #${venta.id}?\n\nCliente: ${venta.cliente_nombre || "Cliente no registrado"}\nTotal: $${venta.total.toLocaleString('es-AR')}\n\nEsta acción no se puede deshacer.`
      );
      if (!confirmar) {
        notify.info('Eliminación cancelada');
        return;
      }
      try {
        // Esperar a que la acción async complete y verificar resultado
        await dispatch(eliminarVenta(venta.id)).unwrap();
        // Refrescar datos críticos para que la UI refleje cambios (stock, caja, ventas)
        dispatch(fetchVentas());
        dispatch(fetchProductos());
        dispatch(obtenerCajaActual());
        notify.success('Venta eliminada correctamente.');
      } catch (err) {
        console.error('Error al eliminar venta:', err);
        notify.error(`Error al eliminar la venta: ${err?.message || err}`, { autoClose: 5000 });
      }
    } catch (err) {
      // no-op
    }
  };

  return (
    <div className="ventas-historicas-table-wrapper">
      {ventasParaMostrar.length === 0 ? (
        <div className="ventas-historicas-no-results">
          No se encontraron ventas con los criterios de búsqueda.
        </div>
      ) : (
        <>
          <div className="ventas-historicas-table-container">
            <table className="ventas-historicas-table">
              <thead>
                <tr>
                  <th># venta</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Vendedor</th>
                  <th>Total</th>
                  <th>Método de pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventasParaMostrar.map((venta, idx) => (
                  <tr key={`${venta.id}-${idx}`}>
                    <td onClick={() => handleVerVenta(venta)} style={{ cursor: 'pointer' }}>#{venta.id}</td>
                    <td onClick={() => handleVerVenta(venta)} style={{ cursor: 'pointer' }}>{formatearFecha(venta.fecha_venta)}</td>
                    <td onClick={() => handleVerVenta(venta)} style={{ cursor: 'pointer' }}>{venta.cliente_nombre || "Cliente no registrado"}</td>
                    <td onClick={() => handleVerVenta(venta)} style={{ cursor: 'pointer' }}>{venta.cantidad_productos}</td>
                    <td onClick={() => handleVerVenta(venta)} style={{ cursor: 'pointer' }}>{venta.vendedor_nombre || "Admin"}</td>
                    <td onClick={() => handleVerVenta(venta)} style={{ cursor: 'pointer' }}>${venta.total.toLocaleString('es-AR')}</td>
                    <td onClick={() => handleVerVenta(venta)} style={{ cursor: 'pointer' }}>{venta.metodo_pago || "No especificado"}</td>
                    <td>
                      <div className="ventas-historicas-actions">
                        <button 
                          className="ventas-historicas-action-btn view-btn"
                          onClick={() => handleVerVenta(venta)}
                          title="Ver detalle"
                        >
                          🔍
                        </button>
                        <button 
                          className="ventas-historicas-action-btn delete-btn"
                          onClick={(e) => handleEliminarVenta(venta, e)}
                          title="Eliminar venta"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Resumen de registros - FUERA del container con scroll */}
          <div className="ventas-historicas-summary">
            <span className="registros-info">
              Mostrando <strong>{ventasParaMostrar.length}</strong> registros
            </span>
          </div>
        </>
      )}
      
      {/* Modal para ver detalle de venta */}
      {modalVisible && ventaSeleccionada && (
        <ModalVerVenta 
          venta={ventaSeleccionada}
          onClose={handleCerrarModal}
        />
      )}
    </div>
  );
};

export default VentasHistoricasTable;
