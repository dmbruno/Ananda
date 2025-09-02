import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductos } from '../store/productosSlice';
import Sidebar from '../components/Sidebar/sidebar';
import DropdownCategoriasSidebar from '../components/SidebarCategorias/DropdownCategoriasSidebar';
import HeaderUserBar from '../components/HeaderUserBar/HeaderUserBar';
import TablaStock from '../components/TablaStock/TablaStock';
import { exportarStockAExcel } from '../utils/exportarExcel';
import Buscador from '../components/Buscador/Buscador';
import BotonCustom from '../components/Botones/BotonCustom';

import ModalNuevoProducto from '../components/Modals/ModalNuevoProducto';
import ModalAjustePrecios from '../components/Modals/ModalAjustePrecios';
import './StockPage.css';

const StockPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { subcategoria: subcategoriaParam } = useParams();
  const { categoria, subcategoria, subcategoriaId, categoriaId } = location.state || {};

  // Obtener información del usuario desde Redux
  const user = useSelector(state => state.auth.user);
  const isAdmin = user && user.is_admin === true;

  // Estado para notificaciones
  const [notification, setNotification] = useState(null);

  // Redux state
  const { items: productos, status, error } = useSelector(state => state.productos);
  const loading = status === 'loading';

  const subcategoriaFinal = subcategoria?.nombre || subcategoriaParam?.replace(/-/g, ' ').replace(/y/g, '&');
  const categoriaFinal = categoria?.nombre || 'Categoría';

  // Estados del componente
  const [modoStockFecha, setModoStockFecha] = useState(false);
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [modalAjustePreciosOpen, setModalAjustePreciosOpen] = useState(false);
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState("Stock");
  const [searchTerm, setSearchTerm] = useState('');

  // Función para mostrar notificaciones temporales
  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Desaparece después de 5 segundos
  };

  // Establecer el item activo cuando se carga la página
  useEffect(() => {
    setActiveSidebarItem("Stock");
  }, []);

  // Fetch productos al montar el componente
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProductos());
    }
  }, [dispatch, status]);

  // Efecto para debounce de la búsqueda
  useEffect(() => {
    // Implementamos un simple debounce para mejorar rendimiento
    const timer = setTimeout(() => {
      console.log("Aplicando filtro de búsqueda:", searchTerm);
      // No hacemos nada aquí porque el término ya se aplica automáticamente en productosParaMostrar
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Detectar click en Stock
  const handleSidebarItemClick = (label) => {
    console.log("handleSidebarItemClick called with:", label);
    console.log("Current showDropdownCategorias:", showDropdownCategorias);
    
    setActiveSidebarItem(label);
    
    if (label === "Stock") {
      console.log("Stock clicked - toggling dropdown");
      // Toggle del dropdown en lugar de solo setear a true
      setShowDropdownCategorias(prev => {
        console.log("Previous dropdown state:", prev, "-> New state:", !prev);
        return !prev;
      });
      // NO navegar, solo mostrar dropdown
    } else {
      console.log("Other item clicked:", label);
      setShowDropdownCategorias(false);
      // Navegar para otros items
      // (aquí podrías agregar navegación si fuera necesario)
    }
  };

  // Cerrar dropdown y navegar al seleccionar subcategoría
  const closeCategoriasSidebar = () => {
    setShowDropdownCategorias(false);
    // No limpiar activeSidebarItem si está en Stock para mantener la coherencia visual
  };

  const handleSubcategoriaSelect = (subcategoria, categoria) => {
    closeCategoriasSidebar();
    // Establecer Stock como activo ya que vamos a la página de stock
    setActiveSidebarItem("Stock");
    // Navegar a la página de stock con la subcategoría seleccionada
    const subcategoriaUrl = subcategoria.nombre.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'y');
    navigate(`/stock/${subcategoriaUrl}`, {
      state: { subcategoria, categoria }
    });
  };


 
  

  // Función auxiliar para buscar en todos los campos
  const buscarEnTodosLosCampos = (producto, searchTermLower) => {
    // Lista de todos los campos que queremos incluir en la búsqueda
    const camposBusqueda = [
      producto.id?.toString(),
      producto.nombre,
      producto.codigo,
      producto.categoria_nombre,
      producto.subcategoria_nombre,
      producto.descripcion,
      producto.talle,
      producto.color,
      producto.marca,
      producto.temporada,
      producto.costo?.toString(),
      producto.precio_venta?.toString(),
      producto.stock_actual?.toString(),
      producto.fecha_ingreso
    ];

    // Verificar si alguno de estos campos incluye el término de búsqueda
    return camposBusqueda.some(campo => 
      campo && campo.toLowerCase().includes(searchTermLower)
    );
  };

  const productosParaMostrar = modoStockFecha 
    ? productos.filter(producto => {
        // En modo stock fecha, solo filtrar por término de búsqueda si existe
        if (!searchTerm) return true;
        
        const searchTermLower = searchTerm.toLowerCase();
        return buscarEnTodosLosCampos(producto, searchTermLower);
      })
    : productos.filter(producto => {
        // Filtrar por categoría y subcategoría si están definidas
        const coincideCategoria = !categoriaFinal || categoriaFinal === 'Categoría' || 
          producto.categoria_nombre?.toLowerCase() === categoriaFinal?.toLowerCase();
        const coincideSubcategoria = !subcategoriaFinal || 
          producto.subcategoria_nombre?.toLowerCase() === subcategoriaFinal?.toLowerCase();
          
        // Filtrar por término de búsqueda si existe
        let coincideTermino = true;
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          coincideTermino = buscarEnTodosLosCampos(producto, searchTermLower);
        }
        
        return coincideCategoria && coincideSubcategoria && coincideTermino;
      });

  console.log("Productos mostrados en la tabla después de filtrar:", productosParaMostrar); // Log para depurar

  // Función para exportar a Excel
  const handleExportarExcel = () => {
    // Verificar si el usuario es administrador
    if (!isAdmin) {
      showNotification('Solo los administradores pueden exportar a Excel.', 'warning');
      return;
    }
    
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    const nombreArchivo = modoStockFecha 
      ? `stock-completo-${fecha}.xlsx`
      : `stock-${categoriaFinal || 'categoria'}-${subcategoriaFinal || 'subcategoria'}-${fecha}.xlsx`;
    exportarStockAExcel(productosParaMostrar, nombreArchivo);
  };

  return (
    <div className="stock-page">
      <Sidebar 
        onItemClick={handleSidebarItemClick} 
        activeItem={activeSidebarItem}
        keepExpanded={showDropdownCategorias && activeSidebarItem === "Stock"}
      />
      {showDropdownCategorias && (
        <DropdownCategoriasSidebar
          visible={showDropdownCategorias}
          onSelectSubcategoria={handleSubcategoriaSelect}
          onClose={closeCategoriasSidebar}
        />
      )}      
      <div className="stock-page-content">
        <HeaderUserBar />
        
        {/* Notificación */}
        {notification && (
          <div className={`notificacion notificacion-${notification.type}`}>
            {notification.message}
            <button className="notificacion-close" onClick={() => setNotification(null)}>×</button>
          </div>
        )}
        
        <div className="stock-page-main">
          {/* Header con Breadcrumbs y Botones en la misma línea */}
          <div className="stock-header">
            <div className="stock-breadcrumbs">
              <h1 className="dashboard-title">
                {modoStockFecha 
                  ? "STOCK TOTAL A LA FECHA" 
                  : `STOCK DE > ${(categoriaFinal || 'CATEGORIA')?.toUpperCase()} > ${(subcategoriaFinal || 'SUBCATEGORIA')?.toUpperCase()}`
                }
              </h1>
            </div>

            {/* Botones de acción */}
            <div className={`stock-actions ${modoStockFecha ? 'multiple-buttons' : ''}`}>
              <BotonCustom 
                variant="success" 
                size="medium"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                }
                onClick={() => setModalNuevoOpen(true)}
              >
                Producto
              </BotonCustom>

              {/* Botón de exportar a Excel cuando modo stock fecha */}
              {modoStockFecha && (
                <BotonCustom
                  variant="excel"
                  size="medium"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#22c55e" strokeWidth="2" fill="none"/>
                      <path d="M8 8l8 8M16 8l-8 8" stroke="#22c55e" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  }
                  onClick={handleExportarExcel}
                  disabled={!isAdmin}
                  title={!isAdmin ? "Solo disponible para administradores" : "Exportar a Excel"}
                  className={!isAdmin ? "btn-disabled" : ""}
                >
                  Exportar Excel
                  {!isAdmin && <span className="admin-only-icon">🔒</span>}
                </BotonCustom>
              )}

              <BotonCustom 
                variant={modoStockFecha ? "secondary" : "info"}
                size="medium"
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                }
                onClick={() => setModoStockFecha((prev) => !prev)}
              >
                Stock a la fecha
              </BotonCustom>
            </div>
          </div>

          {/* Buscador con botón de ajuste de precios */}
          <div className="stock-search-container">
            <div className="stock-search-wrapper">
              <Buscador 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en stock..."
              />

              {/* Botón de ajuste de precios junto al buscador - solo visible para admins */}
              {isAdmin && (
                <BotonCustom 
                  variant="warning" 
                  size="medium"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  }
                  onClick={() => setModalAjustePreciosOpen(true)}
                  className="ajustar-precios-btn"
                >
                  Ajustar Precios
                </BotonCustom>
              )}
            </div>
          </div>

          {/* Tabla de productos */}
          <TablaStock 
            productos={productosParaMostrar}
            loading={loading}
            error={error}
          />
        </div>
        {/* Modal para nuevo producto */}
        <ModalNuevoProducto open={modalNuevoOpen} onClose={() => setModalNuevoOpen(false)} />
        
        {/* Modal para ajuste masivo de precios */}
        <ModalAjustePrecios 
          open={modalAjustePreciosOpen} 
          onClose={() => setModalAjustePreciosOpen(false)} 
          modoStockFecha={modoStockFecha}
          categoriaActual={!modoStockFecha ? { id: categoriaId, nombre: categoriaFinal } : null}
          subcategoriaActual={!modoStockFecha && subcategoriaFinal ? { id: subcategoriaId, nombre: subcategoriaFinal } : null}
        />
      </div>
    </div>
  );
};

export default StockPage;
