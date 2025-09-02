import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useSelector(state => state.auth);
  const [redirectCount, setRedirectCount] = useState(0);
  const [tokenVerified, setTokenVerified] = useState(false);

  useEffect(() => {
    // Verificar tokens en localStorage
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    
    // Log para diagnóstico
    console.log('🛡️ ProtectedRoute - Estado de autenticación:', {
      isAuthenticated,
      loading,
      accessToken: accessToken ? '(presente)' : '(ausente)',
      refreshToken: refreshToken ? '(presente)' : '(ausente)',
      user: user ? `ID: ${user.id}` : 'no cargado'
    });
    
    setTokenVerified(true);
    
    // Solo redirigir si no está cargando y no está autenticado
    if (!loading && !isAuthenticated) {
      console.log('🚪 Redirigiendo a login - Usuario no autenticado');
      
      // Incrementar contador de redirecciones para evitar bucles
      setRedirectCount(prev => prev + 1);
      
      // Si hay demasiados intentos de redirección, limpiar tokens
      if (redirectCount > 2) {
        console.error('⚠️ Posible bucle de redirección detectado - Limpiando tokens');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      
      navigate('/login', { replace: true });
      return;
    }
    
    // Si la ruta requiere permisos de administrador, verificar si el usuario es admin
    if (!loading && isAuthenticated && requireAdmin && (!user || !user.is_admin)) {
      console.log('🔒 Acceso denegado - Se requieren permisos de administrador');
      // Redirigir al dashboard sin mensaje
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, loading, navigate, requireAdmin, user, redirectCount]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Rajdhani, sans-serif'
      }}>
        <div>Verificando autenticación...</div>
      </div>
    );
  }

  // Verificar autenticación y permisos de administrador si es necesario
  if (!isAuthenticated) {
    return null;
  }
  
  // Si requiere admin, verificar que el usuario sea administrador
  if (requireAdmin && (!user || !user.is_admin)) {
    return null;
  }
  
  // Si pasa todas las verificaciones, mostrar el contenido
  return children;
};

export default ProtectedRoute;
