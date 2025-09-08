import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [apiError, setApiError] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /\S+@\S+\.\S+/;
    return emailRegex.test(email);
  };


  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación del email
    if (!email.trim()) {
      setValidationError('El correo es requerido');
      return;
    }
    
    if (!validateEmail(email)) {
      setValidationError('Formato de correo inválido');
      return;
    }

    setLoading(true);
    setValidationError('');
    setApiError('');

    try {
      // Llamada a la API de recuperación de contraseña
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setEmailSent(true);
      } else {
        setApiError(data.message || 'Error al enviar el correo');
      }
    } catch (error) {
      console.error('Error:', error);
      setApiError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError('');
    }
    if (apiError) {
      setApiError('');
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="success-content">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#10b981"/>
                <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <h1 className="success-title">Correo Enviado</h1>
            <p className="success-message">
              Hemos enviado las instrucciones de recuperación a <strong>{email}</strong>
            </p>
            <p className="success-submessage">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            
            <div className="success-actions">
              <Link to="/login" className="back-to-login">
                Volver al Login
              </Link>
              <button 
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="send-again"
              >
                Enviar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1 className="forgot-password-title">Recuperar Contraseña</h1>
          <p className="forgot-password-subtitle">
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          {/* Mostrar error de API */}
          {apiError && (
            <div className="forgot-password-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <div className="forgot-password-field">
            <label className="forgot-password-label">Correo electrónico</label>
            <div className="input-container">
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className={`forgot-password-input ${validationError ? 'input-error' : ''}`}
                placeholder="usuario@ejemplo.com"
                autoComplete="email"
                autoFocus
                disabled={loading}
              />
              <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            {validationError && (
              <span className="field-error">{validationError}</span>
            )}
          </div>

          <button
            type="submit"
            className="forgot-password-button"
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
                Enviando...
              </>
            ) : (
              'Enviar Instrucciones'
            )}
          </button>
        </form>

        <div className="forgot-password-footer">
          <Link to="/login" className="back-to-login-link">
            ← Volver al Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
