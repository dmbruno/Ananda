import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';

// Thunk para obtener caja actual
export const obtenerCajaActual = createAsyncThunk(
  'caja/obtenerActual',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔵 Obteniendo caja actual');
      const response = await axios.get('/api/caja/actual');
      console.log('🟢 Caja actual recibida:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔴 Error al obtener caja actual:', error);
      console.error('🔴 Detalles del error:', {
        mensaje: error.message,
        respuesta: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data || { error: error.message }
      );
    }
  }
);

// Thunk para abrir caja
export const abrirCaja = createAsyncThunk(
  'caja/abrir',
  async (montoInicial, { rejectWithValue }) => {
    try {
      console.log('🔵 Iniciando apertura de caja con monto:', montoInicial);
      
      // Asegurarse de que el monto es un número
      const montoNumerico = parseFloat(montoInicial) || 0;
      console.log('🔵 Monto convertido a número:', montoNumerico);
      
      // Log completo de la petición
      console.log('🔵 Enviando petición POST a /api/caja/abrir con datos:', {
        monto_inicial: montoNumerico,
        usuario_id: 1
      });
      
      const response = await axios.post('/api/caja/abrir', {
        monto_inicial: montoNumerico,
        usuario_id: 1 // TODO: Obtener del usuario logueado
      });
      
      console.log('🟢 Respuesta exitosa de abrir caja:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔴 Error al abrir caja:', error);
      console.error('🔴 Detalles del error:', {
        mensaje: error.message,
        respuesta: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      return rejectWithValue(
        error.response?.data || { error: error.message }
      );
    }
  }
);

// Thunk para cerrar caja
export const cerrarCaja = createAsyncThunk(
  'caja/cerrar',
  async (datos, { rejectWithValue }) => {
    try {
      console.log('🔵 Cerrando caja con datos:', datos);
      const response = await axios.post('/api/caja/cerrar', {
        notas: datos.notas || '',
        monto_declarado: parseFloat(datos.monto_declarado) || 0,
        usuario_id: 1 // TODO: Obtener del usuario logueado
      });
      console.log('🟢 Respuesta de cerrar caja:', response.data);
      return response.data;
    } catch (error) {
      console.error('🔴 Error al cerrar caja:', error);
      console.error('🔴 Detalles del error:', {
        mensaje: error.message,
        respuesta: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data || { error: error.message }
      );
    }
  }
);

// Thunk para obtener resumen del día
export const obtenerResumenDia = createAsyncThunk(
  'caja/resumenDia',
  async (fecha) => {
    const response = await axios.get(`/api/caja/resumen-dia?fecha=${fecha}`);
    return response.data;
  }
);

// Thunk para obtener una caja específica por ID
export const obtenerCajaPorId = createAsyncThunk(
  'caja/obtenerPorId',
  async (cajaId, { rejectWithValue }) => {
    try {
      console.log(`🔵 Obteniendo caja con ID: ${cajaId}`);
      const response = await axios.get(`/api/caja/${cajaId}`);
      console.log('🟢 Caja obtenida:', response.data);
      
      // Verificar si la caja tiene ventas
      if (response.data.ventas) {
        console.log(`🟢 La caja tiene ${response.data.ventas.length} ventas asociadas`);
        for (let venta of response.data.ventas) {
          console.log(`🟢 Venta ID: ${venta.id}, Total: ${venta.total}, Método: ${venta.metodo_pago}`);
        }
      } else {
        console.log('🟠 La caja no tiene array de ventas en la respuesta');
      }
      
      return response.data;
    } catch (error) {
      console.error('🔴 Error al obtener caja por ID:', error);
      console.error('🔴 Detalles del error:', {
        mensaje: error.message,
        respuesta: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data || { error: error.message }
      );
    }
  }
);

// Thunk para listar cajas con filtros
export const listarCajas = createAsyncThunk(
  'caja/listar',
  async (filtros = {}, { rejectWithValue }) => {
    try {
      // Construir query string con filtros
      const params = new URLSearchParams();
      
      if (filtros.fechaInicio) params.append('fecha_inicio', filtros.fechaInicio);
      if (filtros.fechaFin) params.append('fecha_fin', filtros.fechaFin);
      if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id);
      if (filtros.estado) params.append('estado', filtros.estado);
      
      const queryString = params.toString();
      // Cambiar la URL para usar /api/caja/listar en lugar de /api/cajas
      const url = `/api/caja/listar${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Listando cajas, URL:', url);
      const response = await axios.get(url);
      console.log('📊 Cajas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al listar cajas:', error);
      console.error('🔴 Detalles del error:', {
        mensaje: error.message,
        respuesta: error.response?.data,
        status: error.response?.status
      });
      return rejectWithValue(
        error.response?.data || { error: error.message }
      );
    }
  }
);

// Thunk para marcar caja como controlada
export const marcarCajaControlada = createAsyncThunk(
  'caja/marcarControlada',
  async (cajaId) => {
    try {
      console.log('🔍 Marcando caja como controlada:', cajaId);
      const response = await axios.post(`/api/caja/marcar-controlada`, { 
        usuario_id: 1, // TODO: Obtener del usuario logueado
        caja_id: cajaId
      });
      console.log('✅ Caja marcada como controlada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al marcar caja como controlada:', error);
      throw error;
    }
  }
);

const cajaSlice = createSlice({
  name: 'caja',
  initialState: {
    cajaActual: null,
    estado: 'cerrada', // 'abierta', 'cerrada', 'controlada'
    resumenDiario: null,
    cajas: [], // Lista de todas las cajas
    loading: false,
    error: null
  },
  reducers: {
    setCajaActual: (state, action) => {
      state.cajaActual = action.payload.caja;
      state.estado = action.payload.estado;
    },
    setResumenDiario: (state, action) => {
      state.resumenDiario = action.payload;
    },
    limpiarError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Obtener caja actual
      .addCase(obtenerCajaActual.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerCajaActual.fulfilled, (state, action) => {
        state.loading = false;
        state.cajaActual = action.payload.caja;
        state.estado = action.payload.estado;
      })
      .addCase(obtenerCajaActual.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Abrir caja
      .addCase(abrirCaja.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(abrirCaja.fulfilled, (state, action) => {
        state.loading = false;
        state.cajaActual = action.payload.caja;
        state.estado = 'abierta';
      })
      .addCase(abrirCaja.rejected, (state, action) => {
        state.loading = false;
        console.error('🔴 Rechazo en cajaSlice:', action);
        if (action.payload) {
          // Si usamos rejectWithValue, el error estará en payload
          state.error = action.payload.error || JSON.stringify(action.payload);
        } else {
          // Si es un error de red o similar
          state.error = action.error.message;
        }
      })
      // Cerrar caja
      .addCase(cerrarCaja.fulfilled, (state) => {
        state.cajaActual = null;
        state.estado = 'cerrada';
      })
      // Resumen diario
      .addCase(obtenerResumenDia.fulfilled, (state, action) => {
        state.resumenDiario = action.payload;
      })
      // Listar cajas
      .addCase(listarCajas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(listarCajas.fulfilled, (state, action) => {
        state.loading = false;
        state.cajas = action.payload;
      })
      .addCase(listarCajas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Marcar caja como controlada
      .addCase(marcarCajaControlada.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(marcarCajaControlada.fulfilled, (state, action) => {
        state.loading = false;
        // Actualizar la caja en la lista
        const index = state.cajas.findIndex(c => c.id === action.payload.caja.id);
        if (index !== -1) {
          state.cajas[index] = action.payload.caja;
        }
        console.log('✅ Caja actualizada en el estado:', action.payload.caja);
      })
      .addCase(marcarCajaControlada.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        console.error('❌ Error en marcarCajaControlada:', action.error);
      })
      // Obtener caja por ID
      .addCase(obtenerCajaPorId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(obtenerCajaPorId.fulfilled, (state, action) => {
        state.loading = false;
        // Almacenar la caja obtenida como caja actual para poder mostrarla en modales
        state.cajaActual = action.payload;
      })
      .addCase(obtenerCajaPorId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setCajaActual, setResumenDiario, limpiarError } = cajaSlice.actions;

export default cajaSlice.reducer;
