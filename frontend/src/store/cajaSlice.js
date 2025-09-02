import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../utils/axios';

// Thunk para obtener caja actual (con limitación para evitar bucles infinitos)
let lastCajaRequest = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos mínimo entre peticiones

export const obtenerCajaActual = createAsyncThunk(
  'caja/obtenerActual',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Evitar peticiones demasiado frecuentes
      const now = Date.now();
      if (now - lastCajaRequest < MIN_REQUEST_INTERVAL) {
        console.log('⏱️ Petición ignorada - demasiado frecuente');
        // Retornar el estado actual para no generar cambios
        const currentState = getState().caja;
        return { 
          caja: currentState.cajaActual, 
          estado: currentState.estado,
          cached: true
        };
      }
      
      // Verificar si tenemos token antes de hacer la petición
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('🔴 No hay token de acceso para obtener caja');
        return rejectWithValue({
          error: 'No hay sesión activa. Inicie sesión para continuar.'
        });
      }
      
      lastCajaRequest = now;
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
      
      // Si es un error de autenticación (401), hacerlo evidente
      if (error.response?.status === 401) {
        return rejectWithValue({
          error: 'Sesión expirada o inválida. Por favor inicie sesión nuevamente.',
          needsLogin: true
        });
      }
      
      return rejectWithValue(
        error.response?.data || { error: error.message }
      );
    }
  },
  {
    // Condición para evitar múltiples llamadas simultáneas
    condition: (_, { getState }) => {
      const { loading } = getState().caja;
      // No disparar si ya hay una petición en curso
      if (loading) {
        console.log('🟡 Petición cancelada - ya hay una en curso');
        return false;
      }
      return true;
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
        monto_inicial: montoNumerico
      });
      
      const response = await axios.post('/api/caja/abrir', {
        monto_inicial: montoNumerico
        // usuario_id se obtiene automáticamente del token JWT
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
        monto_declarado: parseFloat(datos.monto_declarado) || 0
        // usuario_id se obtiene automáticamente del token JWT
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
        
        // IMPORTANTE: Siempre actualizar el estado, incluso si es caché
        console.log('🟢 Actualizando estado de caja:', action.payload);
        
        state.cajaActual = action.payload.caja;
        state.estado = action.payload.estado;
        
        // Log para debugging
        console.log('🟢 Estado actualizado - cajaActual:', state.cajaActual, 'estado:', state.estado);
        
        // Si hay un error en la respuesta (aunque sea código 200)
        if (action.payload.error) {
          state.error = action.payload.error;
        } else {
          state.error = null;
        }
      })
      .addCase(obtenerCajaActual.rejected, (state, action) => {
        state.loading = false;
        
        // Mejorar el mensaje de error para mejor retroalimentación
        if (action.error.name === 'AxiosError' && action.error.message.includes('Network Error')) {
          state.error = 'Error de conexión: No se pudo conectar con el servidor';
          state.estado = 'cerrada';  // Forzar "cerrada" para que se muestre el modal
          state.cajaActual = null;
        } else {
          state.error = action.error.message;
        }
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
