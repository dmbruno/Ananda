import React from 'react';
import { useDispatch } from 'react-redux';
import { agregarAlCarrito } from '../../store/carritoSlice';
import './BotonAgregarCarrito.css';

/**
 * Componente para agregar productos al carrito desde cualquier página
 * @param {Object} producto - El producto a agregar
 * @param {number} cantidad - Cantidad a agregar (opcional, default: 1)
 * @param {string} variant - Variante del botón ('primary', 'secondary', 'icon')
 */
const BotonAgregarCarrito = ({ 
  producto, 
  cantidad = 1, 
  variant = 'primary',
  className = '',
  onSuccess = null 
}) => {
  const dispatch = useDispatch();

  const handleAgregar = () => {
    if (!producto) {
      console.error('❌ No se puede agregar: producto no definido');
      return;
    }

    if (producto.stock_actual <= 0) {
      console.error('❌ No se puede agregar: producto sin stock');
      // Aquí podrías mostrar un toast o notificación
      return;
    }

    const itemCarrito = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio_venta,
      cantidad: Math.min(cantidad, producto.stock_actual),
      stock: producto.stock_actual,
      imagen: producto.imagen || null,
      categoria: producto.categoria?.nombre || '',
      subcategoria: producto.subcategoria?.nombre || ''
    };

    console.log('🛒 Agregando al carrito:', itemCarrito);
    dispatch(agregarAlCarrito(itemCarrito));

    // Ejecutar callback de éxito si se proporciona
    if (onSuccess) {
      onSuccess(itemCarrito);
    }

    // Aquí podrías agregar una notificación de éxito
    // toast.success(`${producto.nombre} agregado al carrito`);
  };

  const getButtonContent = () => {
    switch (variant) {
      case 'icon':
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h2l.4 2M7 13h10l4-8H5.4"/>
              <path d="M7 13L5.4 5M7 13l-2 4h13"/>
            </svg>
          </>
        );
      case 'secondary':
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h2l.4 2M7 13h10l4-8H5.4"/>
              <path d="M7 13L5.4 5M7 13l-2 4h13"/>
            </svg>
            <span>Agregar</span>
          </>
        );
      default: // 'primary'
        return (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h2l.4 2M7 13h10l4-8H5.4"/>
              <path d="M7 13L5.4 5M7 13l-2 4h13"/>
            </svg>
            <span>Agregar al Carrito</span>
          </>
        );
    }
  };

  const isDisabled = !producto || producto.stock_actual <= 0;

  return (
    <button
      className={`boton-agregar-carrito boton-agregar-carrito--${variant} ${className} ${isDisabled ? 'boton-agregar-carrito--disabled' : ''}`}
      onClick={handleAgregar}
      disabled={isDisabled}
      title={isDisabled ? 'Producto sin stock' : `Agregar ${producto?.nombre} al carrito`}
    >
      {getButtonContent()}
    </button>
  );
};

export default BotonAgregarCarrito;
