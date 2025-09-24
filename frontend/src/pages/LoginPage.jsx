import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/authSlice';
import { checkApiAvailability, runAuthDiagnostics } from '../utils/authDiagnostics';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    email: 'dmbruno61@gmail.com', // Credenciales de prueba
    password: 'Diego1234!'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loginError, setLoginError] = useState(''); // Error local persistente

  const { loading, error, isAuthenticated } = useSelector(state => state.auth);

  // Limpiar tokens posiblemente corruptos al cargar la página
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam === 'session_error' || errorParam === 'session_expired') {
      setLoginError('La sesión ha expirado. Por favor inicie sesión nuevamente.');
      // Limpiar URL para no mostrar el mensaje repetidamente
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (errorParam === 'auth_failed') {
      setLoginError('Error de autenticación. Por favor inicie sesión nuevamente.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Si hay un error de autenticación, asegurar que no haya tokens corruptoss
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // NO capturar errores automáticamente - solo manual

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error de validación cuando el usuario comience a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // NO limpiar error de autenticación aquí - que persista
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Formato de correo inválido';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔵 handleSubmit ejecutado');
    
    if (!validateForm()) {
      console.log('🔴 Validación falló');
      return;
    }

    // Limpiar cualquier error previo antes de intentar login
    setLoginError('');
    console.log('🧹 Error limpiado antes de intentar login');

    try {
      // Asegurar que no hay tokens antiguos
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      console.log('🔑 Intentando login con:', {
        email: formData.email,
        password: '[PROTEGIDO]' // Nunca loguear la contraseña real
      });
      
      // Verificar conexión al servidor antes de intentar login
      console.log('🔄 Comprobando conexión al servidor...');
      
      // Limpiar cualquier mensaje de error mientras se procesa
      setLoginError('');
      
      // Intentar el login
      console.log('🚀 Enviando petición de login...');
      const result = await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      }));
      
      // Verificar el resultado
      console.log('📩 Respuesta recibida:', result.type);
      
      // Si el login falló, mostrar error
      if (result.type === 'auth/loginUser/rejected') {
        const errorMessage = result.payload || 'Credenciales incorrectas';
        console.log('🔴 Login fallido:', errorMessage);
        
        // Personalizar mensajes según el tipo de error
        if (typeof errorMessage === 'string' && errorMessage.includes('Network Error')) {
          setLoginError('Error de conexión al servidor. Verifique su conexión a internet.');
        } else {
          setLoginError(errorMessage);
        }

        // En caso de error, asegurarse de limpiar cualquier token parcial
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        console.log('🧹 Tokens limpiados tras error');
      } else {
        console.log('🟢 Login exitoso, verificando tokens...');
        // Verificar si tenemos los tokens necesarios después del login
        const accessToken = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!accessToken || !refreshToken) {
          console.error('⚠️ Login exitoso pero faltan tokens');
          throw new Error('Autenticación incompleta. Faltan tokens de acceso.');
        }
        
        console.log('✅ Login completado con éxito, redirigiendo...');
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      // Para errores de conexión
      setLoginError('Error de conexión. Intenta nuevamente.');
      
      // En caso de error, asegurarse de limpiar cualquier token parcial
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      console.log('Error de conexión seteado');

      // Temporizador para limpiar el error después de 6 segundos
      setTimeout(() => {
        setLoginError('');
        console.log('Error limpiado automáticamente después de 1.5 segundos');
      }, 2000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleCloseError = () => {
    setLoginError('');
  };

  // DIAGNÓSTICO COMENTADO TEMPORALMENTE PARA EVITAR INTERFERENCIAS
  /*
  // Diagnóstico: Ejecutar diagnósticos de autenticación completos
  useEffect(() => {
    const runDiagnostics = async () => {
      console.log('🔍 Ejecutando diagnósticos de autenticación...');
      
      try {
        // Verificar disponibilidad de la API
        const apiAvailable = await checkApiAvailability();
        
        if (!apiAvailable) {
          console.error('❌ API no disponible');
          setLoginError('No se pudo conectar con el servidor. Verifique su conexión.');
          return;
        }
        
        console.log('✅ API disponible');
        
        // Ejecutar diagnóstico completo
        const diagnosticResults = await runAuthDiagnostics();
        console.log('📊 Resultados del diagnóstico:', diagnosticResults);
        
        // Si hay tokens pero no son válidos, mostrar mensaje
        if ((diagnosticResults.hasAccessToken || diagnosticResults.hasRefreshToken) 
            && !diagnosticResults.tokenValid) {
          console.warn('⚠️ Tokens inválidos detectados - limpiando');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setLoginError('Su sesión ha caducado. Por favor inicie sesión nuevamente.');
        }
      } catch (error) {
        console.error('❌ Error al ejecutar diagnósticos:', error);
      }
    };
    
    runDiagnostics();
  }, []);
  */
  
  // Diagnóstico simplificado
  useEffect(() => {
    console.log('📊 Estado inicial de localStorage:', {
      access_token: localStorage.getItem('access_token') ? '(presente)' : '(ausente)',
      refresh_token: localStorage.getItem('refresh_token') ? '(presente)' : '(ausente)'
    });
  }, []);

  // Manejar recargas de página
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      console.log('Intento de recarga detectado');
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Ananda</h1>
          <p className="login-subtitle">Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {/* Mostrar error general */}
          {loginError && (
            <div className="login-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{loginError}</span>
              <button 
                type="button" 
                className="error-close-btn"
                onClick={handleCloseError}
                title="Cerrar mensaje"
              >
                ×
              </button>
            </div>
          )}

          {/* Campo Email */}
          <div className="login-field">
            <label className="login-label">Correo</label>
            <div className="input-container">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`login-input ${validationErrors.email ? 'input-error' : ''}`}
                placeholder="usuario@ejemplo.com"
                autoComplete="off"
                autoFocus
                disabled={loading}
              />
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            {validationErrors.email && (
              <span className="field-error">{validationErrors.email}</span>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="login-field">
            <label className="login-label">Contraseña</label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`login-input ${validationErrors.password ? 'input-error' : ''}`}
                placeholder="Ingresa tu contraseña"
                autoComplete="off"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={loading}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2"/>
                    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
            {validationErrors.password && (
              <span className="field-error">{validationErrors.password}</span>
            )}
          </div>

          {/* Botón de Login */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dasharray" dur="2s" values="32;16;32" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="32;0;-32" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>

          {/* Enlaces adicionales */}
          <div className="login-links">
            <Link to="/forgot-password" className="forgot-password-link">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>&copy; 2025 Ananda. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
