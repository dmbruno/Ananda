import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

/**
 * Componente que maneja la redirección inicial de la aplicación
 * - Si no está autenticado: redirige a /login
 * - Si está autenticado: redirige a /dashboard
 */
const DefaultRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector(state => state.auth);

  useEffect(() => {
    // No redirigir mientras está cargando el estado de autenticación
    if (loading) return;

    // Redirigir según el estado de autenticación
    if (isAuthenticated) {
      console.log('👤 Usuario autenticado, redirigiendo a dashboard');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('🚪 Usuario no autenticado, redirigiendo a login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Mostrar loading mientras se determina la redirección
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontFamily: 'Rajdhani, sans-serif'
    }}>
      <div>Redirigiendo...</div>
    </div>
  );
};

export default DefaultRedirect;
