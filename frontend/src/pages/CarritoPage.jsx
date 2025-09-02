import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar/sidebar';
import DropdownCategoriasSidebar from '../components/SidebarCategorias/DropdownCategoriasSidebar';
import HeaderUserBar from '../components/HeaderUserBar/HeaderUserBar';
import ClientePanel from '../components/CarritoPage/ClientePanel/ClientePanel';
import CarritoPanel from '../components/CarritoPage/CarritoPanel/CarritoPanel';
import StepIndicator from '../components/CarritoPage/StepIndicator/StepIndicator';
import AbrirCajaModal from '../components/CarritoPage/AbrirCajaModal/AbrirCajaModal';
import { obtenerCajaActual } from '../store/cajaSlice';
import { setPaso, validarYCorregirPaso } from '../store/ventaProcesoSlice';
import './CarritoPage.css';

const CarritoPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Estado local para manejar la sidebar
  const [activeSidebarItem, setActiveSidebarItem] = useState('Nueva Venta');
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  
  // Redux state
  const { paso, cliente } = useSelector(state => state.ventaProceso);
  const { items } = useSelector(state => state.carrito);
  const { cajaActual, estado: estadoCaja, loading: cajaLoading } = useSelector(state => state.caja);
  
  // Establecer el item activo cuando se carga la página
  useEffect(() => {
    setActiveSidebarItem('Nueva Venta');
  }, []);

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

  // Verificar estado de caja al cargar la página
  useEffect(() => {
    // Simple, solo verificamos una vez al montar el componente
    console.log('🏪 CarritoPage: Verificando estado de caja al cargar...');
    dispatch(obtenerCajaActual());
  }, [dispatch]);

  // Log del estado de caja para debugging
  useEffect(() => {
    console.log('🏪 CarritoPage - Estado de caja actualizado:', {
      estadoCaja,
      cajaActual: cajaActual ? `ID: ${cajaActual.id}` : 'null',
      cajaLoading
    });
  }, [estadoCaja, cajaActual, cajaLoading]);

  // Lógica inteligente para navegación del carrito
  useEffect(() => {
    console.log('🔍 Verificando estado del carrito:', {
      items: items.length,
      cliente: cliente ? cliente.nombre : 'No seleccionado',
      paso: paso
    });

    // Usar la función validadora para corregir el paso
    dispatch(validarYCorregirPaso({ cliente, items }));
  }, [items, cliente, dispatch]);

  // Log cuando cambie el paso
  useEffect(() => {
    console.log(`📍 Paso actualizado a: ${paso}`);
  }, [paso]);

  // Calcular total de la caja actual (simplificado porque el modelo cambió)
  const totalCaja = cajaActual ? 
    (cajaActual.monto_final || cajaActual.monto_inicial || 0) : 0;

  // Si no hay caja abierta, mostrar modal para abrir caja.
  // Hacer esto incluso si `cajaLoading` es true, porque el usuario espera
  // ver el modal para ingresar el monto inicial mientras se verifica el estado.
  if (estadoCaja === 'cerrada' || estadoCaja === null || estadoCaja === undefined) {
    console.log('🏪 CarritoPage: Mostrando modal de abrir caja. Estado:', estadoCaja, 'cajaLoading:', cajaLoading);
    return <AbrirCajaModal onCajaAbierta={() => {
      console.log('✅ CarritoPage: Caja abierta, refrescando estado...');
      dispatch(obtenerCajaActual());
    }} />;
  }

  // Si está cargando y ya no estamos en estado 'cerrada', mostrar el spinner global
  if (cajaLoading) {
    console.log('🏪 CarritoPage: Mostrando loading de caja...');
    return (
      <div className="carrito-page-loading">
        <div className="loading-spinner">Cargando estado de caja...</div>
      </div>
    );
  }

  console.log('🏪 CarritoPage: Renderizando página normal con caja abierta');

  return (
    <div className="app-container">
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
      <div className="carrito-page">
        {/* Header */}
        <div className="carrito-page-header">
          <div className="carrito-page-title-section">
            <h1 className="dashboard-title">Nueva Venta</h1>
            <div className="carrito-page-caja-info">
              💰 Caja #{cajaActual?.id} - Total: ${totalCaja.toLocaleString('es-AR')}
            </div>
          </div>
          
          {/* Indicador de pasos en el header */}
          <div className="carrito-page-steps-header">
            <StepIndicator currentStep={paso} />
          </div>
          
          <HeaderUserBar />
        </div>

        {/* Layout principal de 2 columnas */}
        <div className="carrito-page-layout">
          {/* Columna izquierda - Cliente */}
          <div className="carrito-page-cliente-column">
            <ClientePanel />
          </div>

          {/* Columna derecha - Carrito */}
          <div className="carrito-page-carrito-column">
            <CarritoPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoPage;
