import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.timeout = 15000; // 15 seconds

// Contador de intentos fallidos para evitar bucles infinitos
let failedRequestCount = 0;
const MAX_FAILED_REQUESTS = 5;

// Variable para controlar si estamos intentando refrescar el token
let isRefreshing = false;
// Cola de peticiones que esperan el token refrescado
let refreshSubscribers = [];

// Función para procesar la cola de peticiones pendientes
const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach(callback => callback(newToken));
  refreshSubscribers = [];
};

// Función para agregar peticiones a la cola
const addSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Agregar interceptor para incluir el token en todas las solicitudes
axios.interceptors.request.use(
  (config) => {
    // Obtener el token de acceso de localStorage
    const token = localStorage.getItem('access_token');
    
    // Si existe token, incluirlo en los headers como Bearer token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add request interceptor for debugging
axios.interceptors.request.use(
  config => {
    console.log(`Request: ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Agregar interceptor de respuesta para manejar errores de autenticación
axios.interceptors.response.use(
  (response) => {
    // Resetear contador de errores cuando hay una respuesta exitosa
    failedRequestCount = 0;
    console.log(`Response from ${response.config.url}:`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // No contar errores en las rutas de autenticación para evitar bucles
    const isAuthRoute = originalRequest.url.includes('/api/auth/');
    if (!isAuthRoute) {
      // Incrementar contador de errores solo para rutas no auth
      failedRequestCount++;
    }
    
    // Log detallado del error
    console.error(`🔴 Error en petición a ${originalRequest.url}:`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Si alcanzamos el máximo de intentos fallidos, mostrar error y limpiar sesión
    if (failedRequestCount > MAX_FAILED_REQUESTS) {
      console.error('⚠️ Demasiados intentos fallidos, probablemente hay un bucle infinito');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login?error=session_error';
      return Promise.reject(new Error('Demasiados intentos fallidos, sesión finalizada'));
    }
    
    // Manejar error 401 (token expirado) pero solo si no estamos en una ruta de autenticación
    if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthRoute) {
      console.log('🔄 Token expirado, intentando refrescar...');
      
      // Marcar para no reintentar infinitamente la misma petición
      originalRequest._retry = true;
      
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (!refreshToken) {
            console.error('❌ No hay refresh token disponible');
            throw new Error('No refresh token available');
          }
          
          console.log('🔄 Enviando petición de refresh token...');
          const response = await axios.post('/api/auth/refresh/', { refresh_token: refreshToken });
          const { access_token } = response.data;
          
          console.log('✅ Token refrescado exitosamente');
          localStorage.setItem('access_token', access_token);
          
          // Actualizar el token en la petición original
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          
          // Procesar cola de peticiones pendientes
          onTokenRefreshed(access_token);
          isRefreshing = false;
          
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          
          // Limpiar tokens y redirigir a login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          isRefreshing = false;
          
          // Redirigir al login
          window.location.href = '/login?error=session_expired';
          return Promise.reject(refreshError);
        }
      } else {
        // Si ya estamos refrescando, agregar esta petición a la cola
        return new Promise((resolve) => {
          addSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axios(originalRequest));
          });
        });
      }
    }
    
    // Log detallado de errores
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default axios;
