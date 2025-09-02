import { useSelector } from 'react-redux';

/**
 * Hook personalizado para obtener información del usuario autenticado
 * @returns {Object} Objeto con información del usuario y métodos útiles
 */
export const useCurrentUser = () => {
  const { user, isAuthenticated, loading } = useSelector(state => state.auth);

  return {
    user,
    isAuthenticated,
    loading,
    userId: user?.id,
    fullName: user ? `${user.nombre} ${user.apellido}` : '',
    firstName: user?.nombre || '',
    lastName: user?.apellido || '',
    email: user?.email || '',
    isAdmin: user?.is_admin || false,
  };
};

export default useCurrentUser;
