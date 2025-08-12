import React, { useState } from 'react';
import './TablaStock.css';
import Buscador from '../Buscador/Buscador';
import axios from 'axios';
import ModalVerProducto from '../Modals/ModalVerProducto';
import { useDispatch } from 'react-redux';
import { updateProducto } from '../../store/productosSlice';

// Recibe productos y loading por props desde StockPage
const TablaStock = ({ productos = [], loading = false, error = null }) => {
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const dispatch = useDispatch();

  const getStockStatus = (stock) => {
    if (stock <= 0) return 'agotado';
    if (stock <= 2) return 'bajo';
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

  const handleEliminarProducto = async (id) => {
    const confirmar = window.confirm('¿Estás seguro de que deseas eliminar este producto?');
    if (!confirmar) return;

    try {
      await axios.delete(`/api/productos/${id}`);
      alert('Producto eliminado con éxito');
      window.location.reload(); // Recargar la página para actualizar la tabla
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      alert('Hubo un error al intentar eliminar el producto');
    }
  };

  const handleRowClick = (producto) => {
    setProductoSeleccionado(producto);
  };

  const closeModal = () => {
    setProductoSeleccionado(null);
  };

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
      <div className="buscador-stock-bar-stock">
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
                <th>Subcategoría</th> {/* Nueva columna para subcategoría */}
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
                  <tr 
                    key={producto.id} 
                    className={`stock-row-${getStockStatus(producto.stock_actual)}`}
                  >
                    <td className="id-cell" onClick={() => handleRowClick(producto)}>{producto.id.toString().padStart(3, '0')}</td>
                    <td className="nombre-cell" onClick={() => handleRowClick(producto)}>{producto.nombre}</td>
                    <td className="sku-cell" onClick={() => handleRowClick(producto)}>{producto.codigo}</td>
                    <td className="categoria-cell" onClick={() => handleRowClick(producto)}>{producto.categoria_nombre}</td>
                    <td className="subcategoria-cell" onClick={() => handleRowClick(producto)}>{producto.subcategoria_nombre}</td>
                    <td className="talle-cell" onClick={() => handleRowClick(producto)}>{producto.talle}</td>
                    <td className="color-cell" onClick={() => handleRowClick(producto)}>{producto.color}</td>
                    <td className="marca-cell" onClick={() => handleRowClick(producto)}>{producto.marca}</td>
                    <td className="temporada-cell" onClick={() => handleRowClick(producto)}>{producto.temporada || '-'}</td>
                    <td className="precio-cell" onClick={() => handleRowClick(producto)}>{formatPrecio(producto.costo)}</td>
                    <td className="precio-cell" onClick={() => handleRowClick(producto)}>{formatPrecio(producto.precio_venta)}</td>
                    <td className={`stock-cell stock-${getStockStatus(producto.stock_actual)}`} onClick={() => handleRowClick(producto)}>
                      {producto.stock_actual}
                    </td>
                    <td className="estado-cell" onClick={() => handleRowClick(producto)}>
                      <span className={`estado-badge ${
                        producto.stock_actual <= 0 ? 'estado-sin-stock' : 
                        !producto.activo ? 'estado-inactivo' : 
                        'estado-activo'
                      }`}>
                        {producto.stock_actual <= 0 ? 'Sin Stock' : 
                        !producto.activo ? 'Inactivo' : 
                        'Activo'}
                      </span>
                    </td>
                    <td className="ingreso-cell" onClick={() => handleRowClick(producto)}>{producto.fecha_ingreso || '-'}</td>
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
                        <button className="btn-eliminar" title="Eliminar producto" onClick={e => { e.stopPropagation(); handleEliminarProducto(producto.id); }}>
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
                  <td colSpan="15" className="no-datos"> {/* Ajustar colspan para nueva columna */}
                    No hay productos para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {productoSeleccionado && (
        <ModalVerProducto 
          producto={productoSeleccionado} 
          onClose={closeModal}
          onProductoActualizado={prodActualizado => {
            dispatch(updateProducto(prodActualizado));
          }}
        />
      )}
    </>
  );
};

export default TablaStock;
