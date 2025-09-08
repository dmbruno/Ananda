import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './ResetPasswordPage.css';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [tokenValid, setTokenValid] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Verificar validez del token al cargar la página
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      

      try {
        const response = await fetch(`${API_URL}/auth/verify-reset-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        setTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar errores cuando el usuario comience a escribir
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password: formData.password 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(true);
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setApiError(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      console.error('Error:', error);
      setApiError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(prev => !prev);
    } else {
      setShowConfirmPassword(prev => !prev);
    }
  };

  // Pantalla de éxito
  if (resetSuccess) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="success-content">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#10b981"/>
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 className="success-title">¡Contraseña Restablecida!</h1>
            <p className="success-message">
              Tu contraseña ha sido actualizada exitosamente.
            </p>
            <p className="success-submessage">
              Serás redirigido al login en unos segundos...
            </p>
            
            <div className="success-actions">
              <Link to="/login" className="back-to-login">
                Ir al Login Ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Token inválido o expirado
  if (tokenValid === false) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="error-content">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 className="error-title">Token Inválido</h1>
            <p className="error-message">
              El enlace de recuperación es inválido o ha expirado.
            </p>
            <p className="error-submessage">
              Por favor, solicita un nuevo enlace de recuperación.
            </p>
            
            <div className="error-actions">
              <Link to="/forgot-password" className="request-new-link">
                Solicitar Nuevo Enlace
              </Link>
              <Link to="/login" className="back-to-login-secondary">
                Volver al Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading mientras se verifica el token
  if (tokenValid === null) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="loading-content">
            <svg className="loading-spinner-big" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="32">
                <animate attributeName="stroke-dasharray" dur="2s" values="32;16;32" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="32;0;-32" repeatCount="indefinite"/>
              </circle>
            </svg>
            <p>Verificando enlace...</p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de reset
  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-header">
          <h1 className="reset-password-title">Nueva Contraseña</h1>
          <p className="reset-password-subtitle">
            Ingresa tu nueva contraseña para completar el proceso de recuperación.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {/* Mostrar error de API */}
          {apiError && (
            <div className="reset-password-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          {/* Campo Nueva Contraseña */}
          <div className="reset-password-field">
            <label className="reset-password-label">Nueva Contraseña</label>
            <div className="input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`reset-password-input ${validationErrors.password ? 'input-error' : ''}`}
                placeholder="Ingresa tu nueva contraseña"
                autoComplete="new-password"
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('password')}
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

          {/* Campo Confirmar Contraseña */}
          <div className="reset-password-field">
            <label className="reset-password-label">Confirmar Contraseña</label>
            <div className="input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`reset-password-input ${validationErrors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Confirma tu nueva contraseña"
                autoComplete="new-password"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => togglePasswordVisibility('confirm')}
                disabled={loading}
              >
                {showConfirmPassword ? (
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
            {validationErrors.confirmPassword && (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            )}
          </div>

          {/* Indicadores de seguridad de contraseña */}
          <div className="password-requirements">
            <p className="requirements-title">La contraseña debe contener:</p>
            <ul className="requirements-list">
              <li className={formData.password.length >= 6 ? 'requirement-met' : ''}>
                Al menos 6 caracteres
              </li>
              <li className={/(?=.*[a-z])/.test(formData.password) ? 'requirement-met' : ''}>
                Una letra minúscula
              </li>
              <li className={/(?=.*[A-Z])/.test(formData.password) ? 'requirement-met' : ''}>
                Una letra mayúscula
              </li>
              <li className={/(?=.*\d)/.test(formData.password) ? 'requirement-met' : ''}>
                Un número
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="reset-password-button"
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
                Actualizando...
              </>
            ) : (
              'Restablecer Contraseña'
            )}
          </button>
        </form>

        <div className="reset-password-footer">
          <Link to="/login" className="back-to-login-link">
            ← Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
