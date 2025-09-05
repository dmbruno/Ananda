import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar/sidebar';
import DropdownCategoriasSidebar from '../components/SidebarCategorias/DropdownCategoriasSidebar';
import HeaderUserBar from '../components/HeaderUserBar/HeaderUserBar';
import BotonCustom from '../components/Botones/BotonCustom';
import Buscador from '../components/Buscador/Buscador';
import { 
  fetchUsuarios, 
  deleteUsuario, 
  clearError,
  clearSelectedUsuario 
} from '../store/usuariosSlice';
import ModalNuevoUsuario from '../components/Modals/ModalNuevoUsuario';
// import ModalEditarUsuario from '../components/Modals/ModalEditarUsuario'; // Lo crearemos después si es necesario
import './UsuariosPage.css';
import notify from '../utils/notify';
import { useConfirm } from '../utils/confirm/ConfirmContext';

const UsuariosPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const confirm = useConfirm();
  
  // Estados para la sidebar
  const [activeSidebarItem, setActiveSidebarItem] = useState("Usuarios");
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  
  // Estados para los modales
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalVerOpen, setModalVerOpen] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);
  const [usuarioParaVer, setUsuarioParaVer] = useState(null);
  
  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  
  // Redux state
  const { items: usuarios, status, error } = useSelector(state => state.usuarios);
  const loading = status === 'loading';

  // Cargar usuarios al montar el componente
  useEffect(() => {
    dispatch(fetchUsuarios());
    
    // Limpiar errores al montar
    return () => {
      dispatch(clearError());
      dispatch(clearSelectedUsuario());
    };
  }, [dispatch]);

  // Funciones para manejar la sidebar
  const handleSidebarItemClick = (label) => {
    setActiveSidebarItem(label);
    
    if (label === "Stock") {
      setShowDropdownCategorias(prev => !prev);
    } else {
      setShowDropdownCategorias(false);
      
      // Navegación a otras páginas
      switch (label) {
        case "Dashboard":
          navigate('/dashboard');
          break;
        case "Nueva Venta":
          navigate('/ventas/nueva');
          break;
        case "ventas":
          navigate('/ventas');
          break;
        case "Categorías":
          navigate('/categorias');
          break;
        case "Clientes":
          navigate('/clientes');
          break;
        case "Ventas Historicas":
          navigate('/ventas/historicas');
          break;
        case "Gestión de Cajas":
          navigate('/cajas');
          break;
        default:
          break;
      }
    }
  };

  const closeCategoriasSidebar = () => {
    setShowDropdownCategorias(false);
  };

  const handleSubcategoriaSelect = (subcategoria, categoria) => {
    closeCategoriasSidebar();
    const subcategoriaUrl = subcategoria.nombre.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'y');
    navigate(`/stock/${subcategoriaUrl}`, {
      state: { subcategoria, categoria }
    });
  };

  // Funciones para manejar usuarios
  const handleNuevoUsuario = () => {
    setModalNuevoOpen(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioParaEditar(usuario);
    setModalEditarOpen(true);
  };

  const handleVerUsuario = (usuario) => {
    setUsuarioParaVer(usuario);
    setModalVerOpen(true);
  };

  const handleEliminarUsuario = async (usuarioId) => {
    try {
      const ok = await confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción marcará al usuario como inactivo pero mantendrá el historial de ventas.');
      if (!ok) {
        notify.info('Eliminación cancelada');
        return;
      }
      await dispatch(deleteUsuario(usuarioId)).unwrap();
      notify.success('Usuario eliminado exitosamente. El historial de ventas se mantiene intacto.');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      notify.error(`Error al eliminar el usuario: ${error?.message || error}`);
    }
  };

  const handleUsuarioGuardado = () => {
    setModalNuevoOpen(false);
    setModalEditarOpen(false);
    setModalVerOpen(false);
    setUsuarioParaEditar(null);
    setUsuarioParaVer(null);
    // Refrescar la lista de usuarios
    dispatch(fetchUsuarios());
  };

  const handleRefresh = () => {
    dispatch(fetchUsuarios());
  };

  // Filtrar usuarios por término de búsqueda
  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar loading
  if (loading && usuarios.length === 0) {
    return (
      <div className="usuarios-page">
        <Sidebar 
          activeItem={activeSidebarItem}
          onItemClick={handleSidebarItemClick}
          keepExpanded={showDropdownCategorias && activeSidebarItem === "Stock"}
        />
        <div className="usuarios-page-content">
          <HeaderUserBar />
          <div className="usuarios-loading">
            <p>Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-page">
      <Sidebar 
        activeItem={activeSidebarItem}
        onItemClick={handleSidebarItemClick}
        keepExpanded={showDropdownCategorias && activeSidebarItem === "Stock"}
      />
      {showDropdownCategorias && (
        <DropdownCategoriasSidebar 
          visible={true}
          onClose={closeCategoriasSidebar}
          onSelectSubcategoria={handleSubcategoriaSelect}
        />
      )}
      
      <div className="usuarios-page-content">
        <HeaderUserBar />
        
        <div className="usuarios-page-main">
          {/* Mostrar error si existe */}
          {error && (
            <div className="usuarios-error">
              <p>Error: {error}</p>
              <button onClick={handleRefresh}>Reintentar</button>
            </div>
          )}

          {/* Header con título y botón */}
          <div className="usuarios-header">
            <div className="usuarios-title-section">
              <h1 className="usuarios-title">Panel de usuarios</h1>
            </div>
            
            <BotonCustom 
              variant="success" 
              size="medium"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              }
              onClick={handleNuevoUsuario}
              disabled={loading}
            >
              Usuario
            </BotonCustom>
          </div>

          {/* Barra de búsqueda */}
          <div className="usuarios-search-section">
            <Buscador
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios..."
            />
          </div>

          {/* Tabla de usuarios */}
          <div className="usuarios-table-container">
            <div className="usuarios-table-wrapper">
              <table className="usuarios-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Correo Electrónico</th>
                    <th>Admin</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="usuarios-empty">
                        {searchTerm ? 'No se encontraron usuarios con ese criterio' : 'No hay usuarios registrados'}
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((usuario) => (
                      <tr 
                        key={usuario.id}
                        onClick={() => handleVerUsuario(usuario)}
                        style={{ cursor: 'pointer' }}
                        title="Haz clic para ver detalles del usuario"
                      >
                        <td>{usuario.id}</td>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.apellido}</td>
                      <td>{usuario.email}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="admin-checkbox">
                          <input 
                            type="checkbox" 
                            checked={usuario.is_admin || false} 
                            readOnly
                            className="checkbox-admin"
                          />
                        </div>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="acciones-buttons">
                          <button 
                            className="btn-ver"
                            onClick={() => handleVerUsuario(usuario)}
                            title="Ver detalles del usuario"
                            disabled={loading}
                          >
                            👁️
                          </button>
                          <button 
                            className="btn-editar"
                            onClick={() => handleEditarUsuario(usuario)}
                            title="Editar usuario"
                            disabled={loading}
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-eliminar"
                            onClick={() => handleEliminarUsuario(usuario.id)}
                            title="Eliminar usuario"
                            disabled={loading}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Footer con conteo de usuarios */}
            <div className="usuarios-table-summary">
              <span className="registros-info">
                {searchTerm.trim() ? (
                  <>
                    Mostrando <strong>{usuariosFiltrados.length}</strong> de <strong>{usuarios.length}</strong> usuarios
                  </>
                ) : (
                  <>
                    Existen <strong>{usuarios.length}</strong> usuarios activos
                  </>
                )}
              </span>
              {loading && <span className="loading-indicator">Actualizando...</span>}
            </div>
          </div>
        </div>

        {/* Modales */}
        <ModalNuevoUsuario 
          open={modalNuevoOpen} 
          onClose={() => setModalNuevoOpen(false)}
          onUsuarioGuardado={handleUsuarioGuardado}
        />
        
        <ModalNuevoUsuario 
          open={modalEditarOpen} 
          onClose={() => setModalEditarOpen(false)}
          usuario={usuarioParaEditar}
          onUsuarioGuardado={handleUsuarioGuardado}
        />
        
        <ModalNuevoUsuario 
          open={modalVerOpen} 
          onClose={() => setModalVerOpen(false)}
          usuario={usuarioParaVer}
          soloLectura={true}
          onUsuarioGuardado={handleUsuarioGuardado}
        />
      </div>
    </div>
  );
};

export default UsuariosPage;
