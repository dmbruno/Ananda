/**
 * Funciones de utilidad para verificar el estado de la API y la autenticación
 */

/**
 * Verifica si la API está disponible
 * @returns {Promise<boolean>} true si la API está disponible, false en caso contrario
 */
export const checkApiAvailability = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    const response = await fetch('http://localhost:5001/api/auth/ping', { 
      method: 'GET',
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);
    
    return response.status === 200;
  } catch (error) {
    console.error('Error al verificar disponibilidad de API:', error);
    return false;
  }
};

/**
 * Verifica si el token JWT es válido
 * @returns {Promise<boolean>} true si el token es válido, false en caso contrario
 */
export const checkTokenValidity = async () => {
  try {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      return false;
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Intenta obtener información del usuario para verificar token
    const response = await fetch('http://localhost:5001/api/auth/me/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    return response.status === 200;
  } catch (error) {
    console.error('Error al verificar validez de token:', error);
    return false;
  }
};

/**
 * Limpia los tokens de autenticación
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Diagnóstico completo del estado de autenticación
 * @returns {Promise<Object>} Resultado del diagnóstico
 */
export const runAuthDiagnostics = async () => {
  const apiAvailable = await checkApiAvailability();
  const tokenValid = apiAvailable ? await checkTokenValidity() : false;
  
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  return {
    apiAvailable,
    tokenValid,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
    timestamp: new Date().toISOString()
  };
};

export default {
  checkApiAvailability,
  checkTokenValidity,
  clearAuthTokens,
  runAuthDiagnostics
};
