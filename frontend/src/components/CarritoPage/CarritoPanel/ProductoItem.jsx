import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  actualizarCantidad, 
  eliminarDelCarrito 
} from '../../../store/carritoSlice';
import './ProductoItem.css';

export default function ProductoItem({ item }) {
  const dispatch = useDispatch();
  const [cantidadInput, setCantidadInput] = useState(item.cantidad);

  const handleCantidadChange = (e) => {
    const nuevaCantidad = parseInt(e.target.value) || 0;
    setCantidadInput(nuevaCantidad);
    
    if (nuevaCantidad > 0 && nuevaCantidad <= item.stock) {
      dispatch(actualizarCantidad({
        id: item.id,
        cantidad: nuevaCantidad
      }));
    }
  };

  const handleIncrement = () => {
    if (cantidadInput < item.stock) {
      const nuevaCantidad = cantidadInput + 1;
      setCantidadInput(nuevaCantidad);
      dispatch(actualizarCantidad({
        id: item.id,
        cantidad: nuevaCantidad
      }));
    }
  };

  const handleDecrement = () => {
    if (cantidadInput > 1) {
      const nuevaCantidad = cantidadInput - 1;
      setCantidadInput(nuevaCantidad);
      dispatch(actualizarCantidad({
        id: item.id,
        cantidad: nuevaCantidad
      }));
    }
  };

  const handleEliminar = () => {
    dispatch(eliminarDelCarrito(item.id));
  };

  const subtotal = item.precio * item.cantidad;

  return (
    <div className="producto-item">
      <div className="producto-item-imagen">
        {item.imagen ? (
          <img 
            src={item.imagen} 
            alt={item.nombre}
            className="producto-item-img"
          />
        ) : (
          <div className="producto-item-img-placeholder">📦</div>
        )}
      </div>

      <div className="producto-item-info">
        <div className="producto-item-nombre">
          {item.nombre}
        </div>
        
        <div className="producto-item-detalles">
          {item.codigo && (
            <span className="producto-item-codigo">#{item.codigo}</span>
          )}
          <span className="producto-item-precio-unitario">
            ${item.precio.toLocaleString('es-AR')} c/u
          </span>
          <span className="producto-item-stock-disponible">
            Stock: {item.stock}
          </span>
        </div>
      </div>

      <div className="producto-item-controles">
        <div className="producto-item-cantidad-container">
          <label className="producto-item-cantidad-label">Cantidad</label>
          <div className="producto-item-cantidad-controles">
            <button
              className="producto-item-btn-cantidad"
              onClick={handleDecrement}
              disabled={cantidadInput <= 1}
            >
              -
            </button>
            <input
              type="number"
              className="producto-item-cantidad-input"
              value={cantidadInput}
              onChange={handleCantidadChange}
              min="1"
              max={item.stock}
            />
            <button
              className="producto-item-btn-cantidad"
              onClick={handleIncrement}
              disabled={cantidadInput >= item.stock}
            >
              +
            </button>
          </div>
        </div>

        <div className="producto-item-subtotal">
          <span className="producto-item-subtotal-label">Subtotal</span>
          <span className="producto-item-subtotal-valor">
            ${subtotal.toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      <div className="producto-item-acciones">
        <button
          className="producto-item-btn-eliminar"
          onClick={handleEliminar}
          title="Eliminar del carrito"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
