
import React, { useState } from 'react';
import './TablaStock.css';
import Buscador from '../Buscador/Buscador';

// Recibe productos y loading por props desde StockPage
const TablaStock = ({ productos = [], loading = false, error = null }) => {
  const [busqueda, setBusqueda] = useState('');

  const getStockStatus = (stock) => {
    if (stock <= 0) return 'agotado';
    if (stock <= 5) return 'bajo';
    return 'normal';
  };

  const formatPrecio = (precio) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  // Filtrado de productos según la búsqueda
  const productosFiltrados = productos.filter((producto) => {
    if (!busqueda.trim()) return true;
    const texto = busqueda.toLowerCase();
    // Buscar en todos los campos string y numéricos relevantes
    return Object.values(producto).some((valor) =>
      String(valor).toLowerCase().includes(texto)
    );
  });

  if (loading) {
    return (
      <div className="tabla-stock-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Buscador arriba, centrado y fuera de la tarjeta de stock */}
      <div className="buscador-stock-bar">
        <Buscador
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar en stock..."
        />
      </div>

      <div className="tabla-stock-container">
        <div className="tabla-stock-header">
          <h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 3h18l-2 13H5L3 3z"/>
              <path d="M6 8h12"/>
            </svg>
            Stock de Productos ({productos.length})
          </h3>
        </div>

        <div className="tabla-stock-wrapper">
          <table className="tabla-stock">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th>Talle</th>
                <th>Color</th>
                <th>Marca</th>
                <th>Temporada</th>
                <th>Costo</th>
                <th>Precio-Venta</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Ingreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.length > 0 ? (
                productosFiltrados.map((producto) => (
                  <tr key={producto.id} className={`stock-row-${getStockStatus(producto.stock_actual)}`}>
                    <td className="id-cell">{producto.id.toString().padStart(3, '0')}</td>
                    <td className="nombre-cell">{producto.nombre}</td>
                    <td className="sku-cell">{producto.codigo}</td>
                    <td className="categoria-cell">{producto.categoria_nombre}</td>
                    <td className="talle-cell">{producto.talle}</td>
                    <td className="color-cell">{producto.color}</td>
                    <td className="marca-cell">{producto.marca}</td>
                    <td className="temporada-cell">-</td>
                    <td className="precio-cell">{formatPrecio(producto.costo)}</td>
                    <td className="precio-cell">{formatPrecio(producto.precio_venta)}</td>
                    <td className={`stock-cell stock-${getStockStatus(producto.stock_actual)}`}>
                      {producto.stock_actual}
                    </td>
                    <td className="estado-cell">
                      <span className={`estado-badge estado-activo`}>
                        Activo
                      </span>
                    </td>
                    <td className="ingreso-cell">-</td>
                    <td className="acciones-cell">
                      <div className="acciones-cell">
                        <button className="btn-carrito" title="Agregar al carrito">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"/>
                            <circle cx="20" cy="21" r="1"/>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                            <line x1="16" y1="5" x2="22" y2="5"/>
                            <line x1="19" y1="2" x2="19" y2="8"/>
                          </svg>
                        </button>
                        <button className="btn-eliminar" title="Eliminar producto">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="no-datos">
                    No hay productos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default TablaStock;
