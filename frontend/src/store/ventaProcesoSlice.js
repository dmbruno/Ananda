import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk para procesar venta completa
export const procesarVenta = createAsyncThunk(
  'ventaProceso/procesarVenta',
  async (ventaData, { getState, rejectWithValue }) => {
    try {
      console.log('🚀 Iniciando procesamiento de venta...');
      const { ventaProceso, caja } = getState();
      
      console.log('📊 Estado actual:', {
        ventaProceso: ventaProceso,
        caja: caja,
        ventaData: ventaData
      });
      
      // Validaciones previas
      if (!ventaProceso.cliente) {
        console.log('❌ Error: No hay cliente seleccionado');
        return rejectWithValue('Debe seleccionar un cliente');
      }
      
      if (!ventaData.items || ventaData.items.length === 0) {
        console.log('❌ Error: No hay items en el carrito');
        return rejectWithValue('Debe agregar al menos un producto');
      }
      
      if (!ventaProceso.metodoPago) {
        console.log('❌ Error: No hay método de pago seleccionado');
        return rejectWithValue('Debe seleccionar un método de pago');
      }
      
      if (!caja.cajaActual) {
        console.log('❌ Error: No hay caja abierta');
        return rejectWithValue('No hay una caja abierta');
      }
      
      console.log('✅ Todas las validaciones pasaron');
      
      // Preparar datos completos de la venta
      const dataCompleta = {
        cliente_id: ventaProceso.cliente.id,
        metodo_pago: ventaProceso.metodoPago,
        descuento: ventaProceso.descuentoPorcentaje,
        items: ventaData.items.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio,
          subtotal: item.precio * item.cantidad
        })),
        total: ventaData.total,
        caja_id: caja.cajaActual.id
      };
      
      console.log('📦 Datos a enviar al backend:', dataCompleta);
      
      // Procesar la venta completa (incluye: guardar venta, descontar stock, actualizar caja)
      console.log('🌐 Enviando petición al backend...');
      const response = await axios.post('/api/ventas/procesar-completa', dataCompleta);
      
      console.log('✅ Respuesta del backend:', response.data);
      return response.data;
    } catch (error) {
      console.log('🔥 Error completo:', error);
      console.log('📋 Error response:', error.response);
      console.log('📋 Error message:', error.message);
      console.log('📋 Error stack:', error.stack);
      
      if (error.response) {
        console.log('📊 Status:', error.response.status);
        console.log('📊 Data:', error.response.data);
        console.log('📊 Headers:', error.response.headers);
        return rejectWithValue(error.response?.data?.error || error.response?.data?.mensaje || `Error HTTP ${error.response.status}`);
      } else if (error.request) {
        console.log('📡 Error de red - no hay respuesta del servidor');
        return rejectWithValue('Error de conexión - servidor no responde');
      } else {
        console.log('⚙️ Error de configuración:', error.message);
        return rejectWithValue('Error de configuración: ' + error.message);
      }
    }
  }
);

const ventaProcesoSlice = createSlice({
  name: 'ventaProceso',
  initialState: {
    paso: 1, // 1: cliente, 2: productos, 3: finalizar
    cliente: null,
    descuentoPorcentaje: 0,
    metodoPago: '',
    procesando: false,
    error: null,
    ventaExitosa: null,
    nuevaVentaCompletada: false
  },
  reducers: {
    setPaso: (state, action) => {
      state.paso = action.payload;
    },
    setCliente: (state, action) => {
      state.cliente = action.payload;
      // Solo avanzar al paso 2 si hay cliente Y hay productos en el carrito
      // La lógica de avance la manejará el componente CarritoPage
      // Aquí solo establecemos el cliente
    },
    setDescuento: (state, action) => {
      const descuento = parseFloat(action.payload) || 0;
      state.descuentoPorcentaje = Math.max(0, Math.min(100, descuento));
    },
    setMetodoPago: (state, action) => {
      state.metodoPago = action.payload;
    },
    setProcesando: (state, action) => {
      state.procesando = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    reiniciarVenta: (state) => {
      state.paso = 1;
      state.cliente = null;
      state.descuentoPorcentaje = 0;
      state.metodoPago = '';
      state.procesando = false;
      state.error = null;
      state.ventaExitosa = null;
      state.nuevaVentaCompletada = false;
    },
    siguientePaso: (state) => {
      if (state.paso < 3) {
        state.paso += 1;
      }
    },
    anteriorPaso: (state) => {
      if (state.paso > 1) {
        state.paso -= 1;
      }
    },
    validarYCorregirPaso: (state, action) => {
      // Recibe { cliente, items } como payload
      const { cliente, items } = action.payload;
      
      // Regla fundamental: Sin cliente, paso 1
      if (!cliente) {
        state.paso = 1;
        return;
      }
      
      // Con cliente pero sin productos, paso 1
      if (cliente && (!items || items.length === 0)) {
        state.paso = 1;
        return;
      }
      
      // Con cliente y productos, puede estar en paso 2 o 3
      if (cliente && items && items.length > 0) {
        // Si está en paso 1, avanzar a paso 2
        if (state.paso === 1) {
          state.paso = 2;
        }
        // Si ya está en paso 2 o 3, mantenerlo
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(procesarVenta.pending, (state) => {
        state.procesando = true;
        state.error = null;
      })
      .addCase(procesarVenta.fulfilled, (state, action) => {
        state.procesando = false;
        state.ventaExitosa = action.payload;
        state.error = null;
        state.nuevaVentaCompletada = true;  // Nueva bandera para indicar venta completada
        // Mantener en paso 3 para mostrar confirmación
        state.paso = 3;
      })
      .addCase(procesarVenta.rejected, (state, action) => {
        state.procesando = false;
        state.error = action.payload;
      });
  }
});

export const {
  setPaso,
  setCliente,
  setDescuento,
  setMetodoPago,
  setProcesando,
  setError,
  reiniciarVenta,
  siguientePaso,
  anteriorPaso,
  validarYCorregirPaso
} = ventaProcesoSlice.actions;

export default ventaProcesoSlice.reducer;
