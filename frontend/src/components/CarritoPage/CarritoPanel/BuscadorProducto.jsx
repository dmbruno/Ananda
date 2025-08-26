import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { agregarAlCarrito } from '../../../store/carritoSlice';
import './BuscadorProducto.css';

export default function BuscadorProducto({ productos = [], busqueda, onBusquedaChange }) {
  const dispatch = useDispatch();
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    if (busqueda.trim()) {
      const filtrados = productos.filter(producto => {
        const nombre = producto.nombre?.toLowerCase() || '';
        const codigo = producto.codigo?.toLowerCase() || '';
        const categoria = producto.categoria?.nombre?.toLowerCase() || '';
        const marca = producto.marca?.toLowerCase() || '';
        const busquedaLower = busqueda.toLowerCase();
        
        return nombre.includes(busquedaLower) ||
               codigo.includes(busquedaLower) ||
               categoria.includes(busquedaLower) ||
               marca.includes(busquedaLower);
      }).slice(0, 8); // Limitar a 8 resultados
      
      setProductosFiltrados(filtrados);
      setMostrarSugerencias(true);
    } else {
      setProductosFiltrados([]);
      setMostrarSugerencias(false);
    }
  }, [busqueda, productos]);

  const handleInputChange = (e) => {
    onBusquedaChange(e.target.value);
  };

  const handleAgregarProducto = (producto) => {
    if (producto.stock_actual > 0) {
      dispatch(agregarAlCarrito({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio_venta || producto.precio,
        stock: producto.stock_actual || producto.stock,
        imagen: producto.imagen_url,
        codigo: producto.codigo
      }));
      
      // Limpiar búsqueda después de agregar
      onBusquedaChange('');
      setMostrarSugerencias(false);
    }
  };

  const handleFocus = () => {
    if (busqueda.trim()) {
      setMostrarSugerencias(true);
    }
  };

  const handleBlur = () => {
    // Delay para permitir el click en sugerencias
    setTimeout(() => {
      setMostrarSugerencias(false);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && productosFiltrados.length === 1) {
      e.preventDefault();
      handleAgregarProducto(productosFiltrados[0]);
    }
  };

  return (
    <div className="buscador-producto">
      <h3 className="buscador-producto-titulo">Agregar Productos</h3>
      
      <div className="buscador-producto-input-container">
        <div className="buscador-producto-input-wrapper">
          <i className="buscador-producto-icono">🔍</i>
          <input
            type="text"
            className="buscador-producto-input"
            placeholder="Buscar productos por nombre, código o categoría..."
            value={busqueda}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          {busqueda && (
            <button
              className="buscador-producto-limpiar"
              onClick={() => onBusquedaChange('')}
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {mostrarSugerencias && (
          <div className="buscador-producto-sugerencias">
            {productosFiltrados.length > 0 ? (
              <div className="buscador-producto-lista">
                {productosFiltrados.map(producto => (
                  <div
                    key={producto.id}
                    className={`buscador-producto-item ${(producto.stock_actual || producto.stock) === 0 ? 'buscador-producto-item-sin-stock' : ''}`}
                    onClick={() => handleAgregarProducto(producto)}
                  >
                    <div className="buscador-producto-item-imagen">
                      {producto.imagen_url ? (
                        <img 
                          src={producto.imagen_url} 
                          alt={producto.nombre}
                          className="buscador-producto-imagen"
                        />
                      ) : (
                        <div className="buscador-producto-imagen-placeholder">📦</div>
                      )}
                    </div>
                    
                    <div className="buscador-producto-item-info">
                      <div className="buscador-producto-item-principal">
                        <span className="buscador-producto-item-nombre">
                          {producto.nombre}
                        </span>
                        <span className="buscador-producto-item-precio">
                          ${(producto.precio_venta || producto.precio).toLocaleString('es-AR')}
                        </span>
                      </div>
                      
                      <div className="buscador-producto-item-detalles">
                        {producto.codigo && (
                          <span className="buscador-producto-item-codigo">
                            #{producto.codigo}
                          </span>
                        )}
                        <span className={`buscador-producto-item-stock ${(producto.stock_actual || producto.stock) === 0 ? 'buscador-producto-stock-cero' : ''}`}>
                          Stock: {producto.stock_actual || producto.stock}
                        </span>
                        {producto.categoria && (
                          <span className="buscador-producto-item-categoria">
                            {producto.categoria.nombre}
                          </span>
                        )}
                      </div>
                    </div>

                    {(producto.stock_actual || producto.stock) > 0 ? (
                      <div className="buscador-producto-item-accion">
                        ➕
                      </div>
                    ) : (
                      <div className="buscador-producto-item-sin-stock-badge">
                        Sin Stock
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="buscador-producto-sin-resultados">
                <div className="buscador-producto-sin-resultados-icono">😞</div>
                <p>No se encontraron productos con "{busqueda}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
