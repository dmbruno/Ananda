import { createSlice } from '@reduxjs/toolkit';

const carritoSlice = createSlice({
  name: 'carrito',
  initialState: {
    items: [],
    total: 0,
    cantidadTotal: 0
  },
  reducers: {
    agregarAlCarrito: (state, action) => {
      const producto = action.payload;
      const itemExistente = state.items.find(item => item.id === producto.id);
      
      if (itemExistente) {
        // Si el producto ya existe, aumentar cantidad (sin exceder stock)
        const nuevaCantidad = itemExistente.cantidad + (producto.cantidad || 1);
        if (nuevaCantidad <= (producto.stock || itemExistente.stock)) {
          itemExistente.cantidad = nuevaCantidad;
        } else {
          // Si excede el stock, usar el máximo disponible
          itemExistente.cantidad = producto.stock || itemExistente.stock;
        }
      } else {
        // Si es un producto nuevo, agregarlo
        state.items.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: producto.cantidad || 1,
          stock: producto.stock,
          imagen: producto.imagen || null,
          categoria: producto.categoria || '',
          subcategoria: producto.subcategoria || ''
        });
      }
      
      // Recalcular totales
      carritoSlice.caseReducers.calcularTotales(state);
    },
    
    eliminarDelCarrito: (state, action) => {
      const productoId = action.payload;
      state.items = state.items.filter(item => item.id !== productoId);
      carritoSlice.caseReducers.calcularTotales(state);
    },
    
    actualizarCantidad: (state, action) => {
      const { id, cantidad } = action.payload;
      const item = state.items.find(item => item.id === id);
      
      if (item && cantidad > 0 && cantidad <= item.stock) {
        item.cantidad = cantidad;
        carritoSlice.caseReducers.calcularTotales(state);
      }
    },
    
    vaciarCarrito: (state) => {
      state.items = [];
      state.total = 0;
      state.cantidadTotal = 0;
    },
    
    calcularTotales: (state) => {
      state.cantidadTotal = state.items.reduce((total, item) => total + item.cantidad, 0);
      state.total = state.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }
  }
});

export const {
  agregarAlCarrito,
  eliminarDelCarrito,
  actualizarCantidad,
  vaciarCarrito,
  calcularTotales
} = carritoSlice.actions;

export default carritoSlice.reducer;
