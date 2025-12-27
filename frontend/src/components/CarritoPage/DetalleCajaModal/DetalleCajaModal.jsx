import React, { useState } from 'react';
import { formatearFechaHoraLocal } from '../../../utils/dateUtils';
import './DetalleCajaModal.css';

const DetalleCajaModal = ({ caja, onClose }) => {
  if (!caja) return null;
  
  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const ventasPerPage = 15;
  
  // Calcular total de ventas
  let totalVentas = 0;
  let cantidadVentas = 0;
  let ventasList = [];
  
  if (caja.ventas && Array.isArray(caja.ventas) && caja.ventas.length > 0) {
    ventasList = caja.ventas;
    totalVentas = caja.ventas.reduce((sum, venta) => {
      const ventaTotal = venta && typeof venta.total === 'number' ? venta.total : 0;
      return sum + ventaTotal;
    }, 0);
    cantidadVentas = caja.ventas.length;
  } else {
    totalVentas = caja.ventas_total || 0;
    cantidadVentas = caja.ventas_cantidad || 0;
  }
  
  // Calcular montos y diferencia
  const montoSistema = parseFloat(caja.monto_inicial || 0) + totalVentas;
  const montoDeclarado = parseFloat(caja.monto_final || 0);
  const diferencia = montoDeclarado - montoSistema;
  
  // Determinar el tipo de diferencia para el estilo
  const diferenciaType = diferencia === 0 ? 'igual' : (diferencia > 0 ? 'positiva' : 'negativa');

  // Formatear fechas para visualización
  const formatFecha = (fechaStr) => {
    if (!fechaStr) return '-';
    const fecha = new Date(fechaStr);
    fecha.setHours(fecha.getHours() - 3);
    return fecha.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Paginación
  const indexOfLastVenta = currentPage * ventasPerPage;
  const indexOfFirstVenta = indexOfLastVenta - ventasPerPage;
  const currentVentas = ventasList.slice(indexOfFirstVenta, indexOfLastVenta);
  const totalPages = Math.ceil(ventasList.length / ventasPerPage);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="detalle-caja-modal-overlay">
      <div className="detalle-caja-modal">
        <div className="detalle-caja-modal-header">
          <h2>📋 Detalle de Cierre de Caja #{caja.id}</h2>
          <p>
            {formatFecha(caja.fecha_apertura)} a {formatFecha(caja.fecha_cierre)}
          </p>
        </div>

        <div className="detalle-caja-modal-resumen">
          <div className="resumen-seccion">
            <h3>Resumen Financiero</h3>
            <div className="resumen-item">
              <span className="resumen-label">Monto Inicial:</span>
              <span className="resumen-valor">${parseFloat(caja.monto_inicial || 0).toLocaleString('es-AR')}</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Ventas Realizadas:</span>
              <span className="resumen-valor">{cantidadVentas}</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Total Ventas:</span>
              <span className="resumen-valor">${totalVentas.toLocaleString('es-AR')}</span>
            </div>
            <div className="resumen-item total">
              <span className="resumen-label">Monto en Sistema:</span>
              <span className="resumen-valor">${montoSistema.toLocaleString('es-AR')}</span>
            </div>
            <div className="resumen-item declarado">
              <span className="resumen-label">Monto Declarado:</span>
              <span className="resumen-valor">${montoDeclarado.toLocaleString('es-AR')}</span>
            </div>
            <div className={`diferencia-caja ${diferenciaType}`}>
              <span className="diferencia-label">Diferencia:</span>
              <span className="diferencia-valor">
                {diferencia === 0 ? '$0.00' : 
                diferencia > 0 ? `+$${diferencia.toFixed(2)}` : 
                `-$${Math.abs(diferencia).toFixed(2)}`}
              </span>
            </div>
          </div>
          
          <div className="resumen-seccion">
            <h3>Información del Cierre</h3>
            <div className="resumen-item">
              <span className="resumen-label">Usuario Apertura:</span>
              <span className="resumen-valor">
                {caja.usuario_apertura 
                  ? `${caja.usuario_apertura.nombre || ''} ${caja.usuario_apertura.apellido || ''}`.trim() || 'Usuario #' + caja.usuario_apertura.id
                  : caja.usuario_apertura_id ? 'Usuario #' + caja.usuario_apertura_id : '-'}
              </span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Usuario Cierre:</span>
              <span className="resumen-valor">
                {caja.usuario_cierre 
                  ? `${caja.usuario_cierre.nombre || ''} ${caja.usuario_cierre.apellido || ''}`.trim() || 'Usuario #' + caja.usuario_cierre.id
                  : caja.usuario_cierre_id ? 'Usuario #' + caja.usuario_cierre_id : '-'}
              </span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Fecha Apertura:</span>
              <span className="resumen-valor">{formatFecha(caja.fecha_apertura)}</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Fecha Cierre:</span>
              <span className="resumen-valor">{formatFecha(caja.fecha_cierre)}</span>
            </div>
            <div className="resumen-item">
              <span className="resumen-label">Estado:</span>
              <span className={`resumen-valor estado-${caja.estado}`}>
                {caja.estado === 'abierta' ? 'Abierta' : 
                 caja.estado === 'cerrada' ? 'Cerrada' : 
                 caja.estado === 'controlada' ? 'Controlada' : caja.estado}
              </span>
            </div>
          </div>
        </div>
        
        <div className="detalle-caja-modal-notas">
          <h3>Notas del Cierre</h3>
          <div className="notas-contenido">
            {caja.notas_cierre ? caja.notas_cierre : <em>No se agregaron notas en el cierre.</em>}
          </div>
        </div>

        {/* Si hay ventas, mostrar el detalle */}
        {(ventasList && ventasList.length > 0) ? (
          <div className="ventas-detalle">
            <h3>Ventas registradas ({ventasList.length})</h3>
            <div className="ventas-tabla-container">
              <table className="ventas-tabla">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Método</th>
                    <th>Total</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVentas.map(venta => (
                    <tr key={venta.id}>
                      <td>{venta.id}</td>
                      <td>{venta.cliente_nombre || (venta.cliente && `${venta.cliente.nombre || ''} ${venta.cliente.apellido || ''}`.trim()) || 'Cliente #' + venta.cliente_id}</td>
                      <td>{venta.metodo_pago}</td>
                      <td>${venta.total ? venta.total.toLocaleString('es-AR') : '0'}</td>
                      <td>{formatearFechaHoraLocal(venta.fecha_venta || venta.fecha).split(' ')[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {ventasList.length > ventasPerPage && (
              <div className="paginacion-container">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="paginacion-btn"
                >
                  Anterior
                </button>
                <span className="paginacion-info">
                  Página {currentPage} de {totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="paginacion-btn"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="ventas-detalle-vacia">
            <h3>No hay ventas registradas</h3>
            <p>Esta caja no tiene ventas asociadas o no se pudieron cargar los datos.</p>
          </div>
        )}
        
        <div className="detalle-caja-modal-actions">
          <button
            onClick={onClose}
            className="detalle-caja-modal-btn-primary"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleCajaModal;
