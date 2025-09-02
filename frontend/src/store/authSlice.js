import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Importar nuestra instancia de axios ya configurada con los interceptores
import axios from '../utils/axios';

// Ya no configuramos los interceptores aquí porque lo hacemos en utils/axios.js
// Ya no exponemos esta función, la dejamos como comentario para referencia
// const setupAxiosInterceptors = () => {
//   console.log('🔵 Interceptores de axios ya configurados en utils/axios.js');
// };

// Thunk para login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔵 Intentando login con credenciales:', {
        email: credentials.email,
        password: '********' // No loguear la contraseña real
      });
      
      const response = await axios.post('/api/auth/login/', credentials);
      
      console.log('🟢 Login exitoso, respuesta:', {
        access_token: response.data.access_token ? '****' : undefined,
        refresh_token: response.data.refresh_token ? '****' : undefined,
        user: response.data.user
      });
      
      // Guardar tokens en localStorage
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      
      return response.data;
    } catch (error) {
      console.error('🔴 Error en login:', error);
      
      // Información detallada sobre el error
      let errorDetails = '';
      if (error.response) {
        console.error('🔴 Respuesta del servidor:', error.response.status, error.response.data);
        errorDetails = `Status: ${error.response.status}, `;
      } else if (error.request) {
        console.error('🔴 Sin respuesta del servidor');
        errorDetails = 'Sin respuesta del servidor, ';
      }
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        `${errorDetails}Credenciales incorrectas`;
        
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para logout
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await axios.post('/api/auth/logout/');
    } catch (error) {
      // Incluso si falla el logout en el servidor, limpiamos local
      console.error('Error en logout:', error);
    } finally {
      // Limpiar tokens locales
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
);

// Thunk para refrescar token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (!refresh_token) {
        throw new Error('No refresh token');
      }

      const response = await axios.post('/api/auth/refresh/', {
        refresh_token
      });

      localStorage.setItem('access_token', response.data.access_token);
      return response.data;
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      return rejectWithValue('Sesión expirada');
    }
  }
);

// Thunk para obtener datos del usuario actual
export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Intentando obtener datos del usuario actual...');
      console.log('🔑 Token actual:', localStorage.getItem('access_token'));
      
      const response = await axios.get('/api/auth/me/');
      
      console.log('✅ Datos del usuario obtenidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener datos del usuario:', error);
      if (error.response) {
        console.error('❌ Respuesta del servidor:', error.response.data);
        console.error('❌ Estado HTTP:', error.response.status);
      } else if (error.request) {
        console.error('❌ Sin respuesta del servidor');
      } else {
        console.error('❌ Error de configuración:', error.message);
      }
      return rejectWithValue('Error al obtener datos del usuario: ' + (error.response?.data?.error || error.message));
    }
  }
);

// Thunk para recuperar contraseña
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/forgot-password/', { email });
      return response.data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Error al enviar email de recuperación';
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para resetear contraseña
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/auth/reset-password/', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      return response.data;
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        'Error al resetear contraseña';
      return rejectWithValue(errorMessage);
    }
  }
);

// Estado inicial
const initialState = {
  user: null,
  token: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  loading: false,
  error: null,
  passwordResetSent: false,
  passwordResetSuccess: false
};

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPasswordReset: (state) => {
      state.passwordResetSent = false;
      state.passwordResetSuccess = false;
    },
    setCredentials: (state, action) => {
      const { user, access_token } = action.payload;
      state.user = user;
      state.token = access_token;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        // No limpiar error aquí - que persista hasta que el usuario lo cierre
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
      })
      
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })
      
      // Get Current User
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
      })
      
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetSent = true;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.passwordResetSuccess = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearPasswordReset, setCredentials } = authSlice.actions;
// Ya no exportamos setupAxiosInterceptors aquí porque ahora se configura en utils/axios.js
export default authSlice.reducer;
