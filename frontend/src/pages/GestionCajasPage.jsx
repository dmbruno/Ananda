import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/sidebar';
import DropdownCategoriasSidebar from '../components/SidebarCategorias/DropdownCategoriasSidebar';
import { listarCajas, marcarCajaControlada, obtenerCajaActual, obtenerCajaPorId } from '../store/cajaSlice';
import AbrirCajaModal from '../components/CarritoPage/AbrirCajaModal/AbrirCajaModal';
import CerrarCajaModal from '../components/CarritoPage/CerrarCajaModal/CerrarCajaModal';
import DetalleCajaModal from '../components/CarritoPage/DetalleCajaModal/DetalleCajaModal';
import HeaderUserBar from '../components/HeaderUserBar/HeaderUserBar';
import './GestionCajasPage.css';

const GestionCajasPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cajas, loading } = useSelector((state) => state.caja);
  
  // Obtener información del usuario desde Redux
  const user = useSelector(state => state.auth.user);
  // Verificar si el usuario es administrador
  const isAdmin = user && user.is_admin === true;
  
  // Estado para el mensaje de notificación
  const [notification, setNotification] = useState(null);
  
  // Estado local para manejar la sidebar
  const [activeSidebarItem, setActiveSidebarItem] = useState('Gestión de Cajas');
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  
  const [aperturaCajaVisible, setAperturaCajaVisible] = useState(false);
  const [cierreCajaVisible, setCierreCajaVisible] = useState(false);
  const [detalleCajaVisible, setDetalleCajaVisible] = useState(false);
  const [cajaActual, setCajaActual] = useState(null);
  const [filtros, setFiltros] = useState({
    estado: 'todas', // todas, abiertas, cerradas, controladas
    fechaInicio: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0]
  });

  // Establecer el item activo cuando se carga la página
  useEffect(() => {
    setActiveSidebarItem("Gestión de Cajas");
  }, []);

  // Función para mostrar notificaciones temporales
  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Desaparece después de 5 segundos
  };

  // Funciones para manejar la sidebar
  const handleSidebarItemClick = (label) => {
    setActiveSidebarItem(label);
    if (label === "Stock") {
      setShowDropdownCategorias(prev => !prev);
    } else {
      setShowDropdownCategorias(false);
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

  useEffect(() => {
    console.log('Cargando lista de cajas...');
    
    // Usar un timeout para asegurar que el componente esté listo
    const timeoutId = setTimeout(() => {
      // Forzar la recarga de cajas
      dispatch(listarCajas())
        .then((response) => {
          console.log('Cajas cargadas:', response.payload);
          if (response.payload && response.payload.length > 0) {
            console.log('Cajas disponibles:', response.payload.length);
            // Buscar cajas abiertas
            const cajasAbiertas = response.payload.filter(caja => caja.fecha_cierre === null);
            console.log('Cajas abiertas:', cajasAbiertas);
          } else {
            console.log('No se encontraron cajas');
          }
        })
        .catch((error) => {
          console.error('Error al cargar cajas:', error);
          // En lugar de mostrar una alerta que podría ser molesta, mostrar un mensaje en la consola
          console.error('Error detallado:', error);
        });
    }, 500); // Esperar 500ms antes de hacer la llamada
    
    // Limpiar el timeout si el componente se desmonta
    return () => clearTimeout(timeoutId);
  }, [dispatch, cierreCajaVisible, aperturaCajaVisible]);

  const handleAbrirCaja = () => {
    // Verificar si ya hay una caja abierta
    const cajaAbierta = cajas?.find(caja => caja.fecha_cierre === null);
    
    if (cajaAbierta) {
      showNotification('Ya existe una caja abierta. Debe cerrarla antes de abrir una nueva.', 'error');
      return;
    }
    
    setAperturaCajaVisible(true);
  };

  const handleCerrarCaja = async (caja) => {
    if (caja.fecha_cierre) {
      showNotification('Esta caja ya está cerrada.', 'error');
      return;
    }
    
    console.log('Cerrando caja:', caja);
    
    try {
      // Obtener información completa de la caja con sus ventas incluidas
      console.log('Obteniendo información completa de la caja para cierre...');
      const response = await dispatch(obtenerCajaPorId(caja.id)).unwrap();
      console.log('Información completa de la caja obtenida para cierre:', response);
      
      // Verificar específicamente la información de ventas
      if (response.ventas && Array.isArray(response.ventas)) {
        console.log(`Ventas recibidas para cierre: ${response.ventas.length}`);
        console.log('Muestra de ventas:', response.ventas.slice(0, 3));
      } else {
        console.warn('No se recibieron ventas en el array ventas de la respuesta para cierre');
        if (response.ventas_total) {
          console.log(`Total de ventas reportado para cierre: ${response.ventas_total}`);
        }
      }
      
      setCajaActual(response);
    } catch (error) {
      console.error('Error al obtener información completa de la caja:', error);
      // Si falla, usar la información que ya teníamos
      setCajaActual(caja);
    }
    
    setCierreCajaVisible(true);
  };

  const handleMarcarControlada = (caja) => {
    if (!caja.fecha_cierre) {
      showNotification('No se puede marcar como controlada una caja que no ha sido cerrada.', 'error');
      return;
    }
    
    if (caja.fecha_control) {
      showNotification('Esta caja ya ha sido controlada.', 'error');
      return;
    }
    
    // Verificar si el usuario es administrador
    if (!isAdmin) {
      showNotification('Solo los administradores pueden marcar cajas como controladas.', 'warning');
      return;
    }
    
    if (confirm(`¿Está seguro que desea marcar la caja #${caja.id} como controlada? Esta acción registrará su usuario como responsable del control.`)) {
      dispatch(marcarCajaControlada(caja.id))
        .unwrap()
        .then(() => {
          showNotification('Caja marcada como controlada exitosamente.', 'success');
          // Recargar la lista de cajas para asegurar que se muestre el estado actualizado
          dispatch(listarCajas());
        })
        .catch((err) => {
          console.error('Error completo al marcar caja como controlada:', err);
          showNotification('Error al marcar la caja como controlada: ' + (err.message || 'Error desconocido'), 'error');
        });
    }
  };
  
  const handleVerDetalleCaja = async (caja) => {
    console.log('Ver detalle de caja:', caja);
    
    try {
      console.log('Obteniendo información completa de la caja...');
      // Obtener información detallada de la caja con sus ventas incluidas
      const response = await dispatch(obtenerCajaPorId(caja.id)).unwrap();
      console.log('Información completa de la caja obtenida:', response);
      
      // Verificar específicamente la información de ventas
      if (response.ventas && Array.isArray(response.ventas)) {
        console.log(`Ventas recibidas en la respuesta: ${response.ventas.length}`);
      } else {
        console.warn('No se recibieron ventas en el array ventas de la respuesta');
        if (response.ventas_total) {
          console.log(`Total de ventas reportado: ${response.ventas_total}`);
        }
      }
      
      setCajaActual(response);
      setDetalleCajaVisible(true);
    } catch (error) {
      console.error('Error al obtener información completa de la caja:', error);
      // Si falla, usar la información que ya teníamos
      setCajaActual(caja);
      setDetalleCajaVisible(true);
    }
  };

  const filtrarCajas = () => {
    if (!cajas || cajas.length === 0) return [];
    
    let cajasFiltradas = [...cajas];
    
    // Filtrar por estado
    if (filtros.estado === 'abiertas') {
      cajasFiltradas = cajasFiltradas.filter(caja => caja.fecha_cierre === null);
    } else if (filtros.estado === 'cerradas') {
      cajasFiltradas = cajasFiltradas.filter(caja => caja.fecha_cierre !== null && caja.fecha_control === null);
    } else if (filtros.estado === 'controladas') {
      cajasFiltradas = cajasFiltradas.filter(caja => caja.fecha_control !== null);
    }
    
    // Ordenar por fecha de apertura (más reciente primero)
    return cajasFiltradas.sort((a, b) => new Date(b.fecha_apertura) - new Date(a.fecha_apertura));
  };

  const getEstadoCaja = (caja) => {
    if (!caja.fecha_cierre) {
      return <span className="estado-abierta">Abierta</span>;
    } else if (!caja.fecha_control) {
      return <span className="estado-cerrada">Cerrada</span>;
    } else {
      return <span className="estado-controlada">Controlada</span>;
    }
  };

  const getDiferenciaCaja = (caja) => {
    if (!caja.fecha_cierre) return '-';
    
    const diferencia = caja.diferencia || 0;
    
    if (diferencia === 0) {
      return <span className="diferencia-igual">$0</span>;
    } else if (diferencia > 0) {
      return <span className="diferencia-positiva">+${diferencia.toFixed(2)}</span>;
    } else {
      return <span className="diferencia-negativa">-${Math.abs(diferencia).toFixed(2)}</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      // Primero, intentemos corregir el desfase horario de +3 horas
      // Crear la fecha original y luego ajustarla
      const originalDate = new Date(dateString);
      
      // Obtener la fecha actual con la zona horaria correcta
      const now = new Date();
      const offsetHours = now.getTimezoneOffset() / 60;
      
      // Considerando que Argentina es GMT-3, ajustar manualmente
      // Si la zona horaria del servidor es UTC, esto ajustará la diferencia
      const adjustedDate = new Date(originalDate);
      adjustedDate.setHours(adjustedDate.getHours() - 3); 
      
      // Mostrar en formato local
      return adjustedDate.toLocaleString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return dateString || '-'; // Si falla, devolver el original o '-'
    }
  };
  
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  return (
    <div className="gestion-cajas-container">
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
      <div className="cajas-header">
        <h1 className="dashboard-title">Gestión de Cajas</h1>
        <div className="header-right">
          <HeaderUserBar />
          <button 
            className="btn-primary" 
            onClick={handleAbrirCaja}
          >
            Abrir Nueva Caja
          </button>
        </div>
      </div>
      
      {/* Notificación */}
      {notification && (
        <div className={`notificacion notificacion-${notification.type}`}>
          {notification.message}
          <button className="notificacion-close" onClick={() => setNotification(null)}>×</button>
        </div>
      )}
      
      <div className="cajas-filtros">
        <div className="filtro-estado">
          <span>Estado:</span>
          <div className="botones-filtro">
            <button 
              className={filtros.estado === 'todas' ? 'btn-active' : 'btn-default'}
              onClick={() => setFiltros({...filtros, estado: 'todas'})}
            >
              Todas
            </button>
            <button 
              className={filtros.estado === 'abiertas' ? 'btn-active btn-abiertas' : 'btn-default'}
              onClick={() => setFiltros({...filtros, estado: 'abiertas'})}
            >
              Abiertas
            </button>
            <button 
              className={filtros.estado === 'cerradas' ? 'btn-active btn-cerradas' : 'btn-default'}
              onClick={() => setFiltros({...filtros, estado: 'cerradas'})}
            >
              Cerradas
            </button>
            <button 
              className={filtros.estado === 'controladas' ? 'btn-active btn-controladas' : 'btn-default'}
              onClick={() => setFiltros({...filtros, estado: 'controladas'})}
            >
              Controladas
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Cargando cajas...</div>
      ) : (
        <div className="cajas-table-container">
          <table className="cajas-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha Apertura</th>
                <th>Usuario Apertura</th>
                <th>Monto Inicial</th>
                <th>Fecha Cierre</th>
                <th>Usuario Cierre</th>
                <th>Monto Final</th>
                <th>Diferencia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrarCajas().map(caja => (
                <tr key={caja.id}>
                  <td>{caja.id}</td>
                  <td>{formatDate(caja.fecha_apertura)}</td>
                  <td>{caja.usuario_apertura ? `${caja.usuario_apertura.nombre} ${caja.usuario_apertura.apellido || ''}` : `ID: ${caja.usuario_apertura_id}`}</td>
                  <td>{formatCurrency(caja.monto_inicial)}</td>
                  <td>{formatDate(caja.fecha_cierre)}</td>
                  <td>{caja.usuario_cierre ? `${caja.usuario_cierre.nombre} ${caja.usuario_cierre.apellido || ''}` : (caja.usuario_cierre_id ? `ID: ${caja.usuario_cierre_id}` : '-')}</td>
                  <td>{formatCurrency(caja.monto_final)}</td>
                  <td>{getDiferenciaCaja(caja)}</td>
                  <td>{getEstadoCaja(caja)}</td>
                  <td>
                    <div className="acciones-caja">
                      <button 
                        className="btn-icon"
                        title="Ver detalle"
                        onClick={() => handleVerDetalleCaja(caja)}
                      >
                        👁️
                      </button>
                      
                      {!caja.fecha_cierre && (
                        <button 
                          className="btn-icon btn-danger"
                          title="Cerrar caja"
                          onClick={() => handleCerrarCaja(caja)}
                        >
                          ❌
                        </button>
                      )}
                      
                      {(caja.fecha_cierre && !caja.fecha_control) && (
                        <button 
                          className={`btn-icon ${isAdmin ? 'btn-success' : 'btn-disabled'}`}
                          title={isAdmin ? "Marcar como controlada" : "Solo administradores pueden marcar como controlada"}
                          onClick={() => handleMarcarControlada(caja)}
                        >
                          ✅
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtrarCajas().length === 0 && (
                <tr>
                  <td colSpan="10" className="no-data">No hay cajas disponibles</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="cajas-table-footer">
            Mostrando <span>{filtrarCajas().length}</span> registros
          </div>
        </div>
      )}
      
      {/* Modales */}
      {aperturaCajaVisible && (
        <AbrirCajaModal 
          onCajaAbierta={() => {
            setAperturaCajaVisible(false);
            dispatch(listarCajas({
              fechaInicio: filtros.fechaInicio,
              fechaFin: filtros.fechaFin
            }));
          }}
        />
      )}
      
      {cierreCajaVisible && cajaActual && (
        <CerrarCajaModal 
          cajaActual={cajaActual}
          onCajaCerrada={() => {
            setCierreCajaVisible(false);
            setCajaActual(null);
            // Recargar las cajas después de cerrar
            dispatch(listarCajas({
              fechaInicio: filtros.fechaInicio,
              fechaFin: filtros.fechaFin
            }));
          }}
          onCancel={() => {
            setCierreCajaVisible(false);
            setCajaActual(null);
          }}
        />
      )}
      
      {detalleCajaVisible && cajaActual && (
        <DetalleCajaModal
          caja={cajaActual}
          onClose={() => {
            setDetalleCajaVisible(false);
            setCajaActual(null);
          }}
        />
      )}
    </div>
  );
};

export default GestionCajasPage;
