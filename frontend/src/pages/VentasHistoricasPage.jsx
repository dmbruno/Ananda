import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchVentas } from "../store/ventasSlice";
import Sidebar from "../components/Sidebar/sidebar";
import DropdownCategoriasSidebar from "../components/SidebarCategorias/DropdownCategoriasSidebar";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar";
import Buscador from "../components/Buscador/Buscador";
import BuscadorPorFechas from "../components/Buscador/BuscadorPorFechas";
import VentasHistoricasTable from "../components/VentasHistoricas/VentasHistoricasTable";
import "../components/Sidebar/Carrito/botonCarrito.css";
import "./VentasHistoricasPage.css";
import notify from '../utils/notify';
import { formatearFechaLocal } from '../utils/dateUtils';

const VentasHistoricasPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: ventas, status } = useSelector((state) => state.ventas);
  const { nuevaVentaCompletada } = useSelector((state) => state.ventaProceso);
  
  // Estado local para manejar la sidebar
  const [activeSidebarItem, setActiveSidebarItem] = useState("Ventas Historicas");
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  
  const [busqueda, setBusqueda] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [rangoActivo, setRangoActivo] = useState(false);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);

  // Establecer el item activo cuando se carga la página
  useEffect(() => {
    setActiveSidebarItem("Ventas Historicas");
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

  // Cargar ventas al iniciar
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchVentas());
    }
  }, [dispatch, status]);
  
  // Cargar ventas cuando se realiza una nueva venta
  useEffect(() => {
    if (nuevaVentaCompletada) {
      console.log('🔄 Nueva venta realizada, recargando ventas...');
      dispatch(fetchVentas());
    }
  }, [dispatch, nuevaVentaCompletada]);

  // Las ventas ya vienen correctamente desde el backend (una venta por registro)
  const ventasParaProcesar = ventas || [];
  
  // Debug: Log para verificar qué ventas estamos recibiendo
  useEffect(() => {
    console.log('🔍 [DEBUG] Total ventas recibidas:', ventasParaProcesar.length);
    if (ventasParaProcesar.length > 0) {
      console.log('🔍 [DEBUG] Últimas 3 ventas:', ventasParaProcesar.slice(-3).map(v => ({
        id: v.id,
        fecha: v.fecha_venta,
        cliente: v.cliente_nombre
      })));
    }
  }, [ventasParaProcesar]);

  // Filtrar ventas según búsqueda y rango de fechas
  useEffect(() => {
    console.log('🔍 [FILTRO] Ejecutando filtrado...');
    console.log('🔍 [FILTRO] Ventas a procesar:', ventasParaProcesar.length);
    console.log('🔍 [FILTRO] rangoActivo:', rangoActivo, 'busqueda:', busqueda);
    
    // Verificar si hay ventas para filtrar
    if (!ventasParaProcesar || ventasParaProcesar.length === 0) {
      setVentasFiltradas([]);
      return;
    }
    
    // Ordenar ventas por fecha - las más recientes primero (ID más alto = más reciente)
    let filtradas = [...ventasParaProcesar].sort((a, b) => {
      // Ordenar por ID descendente (más reciente primero)
      return b.id - a.id;
    });
    
    // Filtrar por término de búsqueda en todas las columnas posibles
    if (busqueda && busqueda.trim() !== '') {
      const busquedaLower = busqueda.toLowerCase().trim();
      
      filtradas = filtradas.filter(venta => {
        // Verificar y obtener valores seguros para cada campo
        const id = venta.id ? venta.id.toString() : '';
        const clienteNombre = venta.cliente_nombre ? venta.cliente_nombre.toLowerCase() : '';
        const vendedorNombre = venta.vendedor_nombre ? venta.vendedor_nombre.toLowerCase() : 'admin';
        const metodoPago = venta.metodo_pago ? venta.metodo_pago.toLowerCase() : '';
        const total = venta.total !== undefined ? venta.total.toString() : '';
        const cantidadProductos = venta.cantidad_productos ? venta.cantidad_productos.toString() : '';
        const fechaVenta = venta.fecha_venta ? venta.fecha_venta.toLowerCase() : '';
        const estado = venta.estado ? venta.estado.toLowerCase() : '';

        // Buscar en todas las columnas
        return (
          id.includes(busquedaLower) ||
          clienteNombre.includes(busquedaLower) || 
          vendedorNombre.includes(busquedaLower) || 
          metodoPago.includes(busquedaLower) || 
          total.includes(busquedaLower) ||
          cantidadProductos.includes(busquedaLower) ||
          fechaVenta.includes(busquedaLower) ||
          estado.includes(busquedaLower)
        );
      });
    }
    
    // Filtrar por rango de fechas si está activo
    if (rangoActivo && desde && hasta) {
      filtradas = filtradas.filter((venta) => {
        if (!venta.fecha_venta) return false;
        
        // Extraer solo la parte de fecha (YYYY-MM-DD) de la fecha de la venta
        const ventaFechaSolo = venta.fecha_venta.split('T')[0];
        
        // Comparar directamente las fechas en formato string YYYY-MM-DD
        return ventaFechaSolo >= desde && ventaFechaSolo <= hasta;
      });
    }
    
    console.log('🔍 [FILTRO] Ventas filtradas finales:', filtradas.length);
    setVentasFiltradas(filtradas);
  }, [busqueda, desde, hasta, rangoActivo, ventasParaProcesar]);

  // Manejar búsqueda
  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
  };

  // Manejar búsqueda por fechas para generar reportes
  const handleBuscar = (desdeParam, hastaParam) => {
    // Si se proporcionan parámetros, usar esos valores
    if (desdeParam && hastaParam) {
      setDesde(desdeParam);
      setHasta(hastaParam);
    }
    
    // Solo activar el filtro si ambas fechas están presentes
    const fechaDesde = desdeParam || desde;
    const fechaHasta = hastaParam || hasta;
    
    if (fechaDesde && fechaHasta) {
      // Aseguramos que el filtro se aplique incluso si las fechas son iguales a las previas
      setRangoActivo(false); // Primero desactivamos
      setTimeout(() => {
        setRangoActivo(true);
      }, 0);
    } else {
      notify.warn('Por favor, seleccione ambas fechas para generar el reporte');
    }
  };

  // Manejar descarga de CSV con todas las columnas relevantes
  const handleDescargarCSV = () => {
    // Formatear fechas para el nombre del archivo
    const desdeFormatted = desde ? desde.replace(/-/g, '') : 'inicio';
    const hastaFormatted = hasta ? hasta.replace(/-/g, '') : 'hoy';
    
    // Preparar datos para CSV con todas las columnas
    const headers = ["ID Venta", "Fecha", "Cliente", "Cantidad Productos", "Vendedor", "Total", "Método de Pago"];
    
    const rows = ventasFiltradas.map(v => {
      // Formatear fecha sin conversión de timezone
      const fecha = v.fecha_venta ? formatearFechaLocal(v.fecha_venta) : '';
      
      // Formatear valor monetario
      const totalFormateado = v.total ? `$${v.total.toLocaleString('es-AR')}` : '$0';
      
      return [
        v.id,
        fecha,
        v.cliente_nombre || "Cliente no registrado",
        v.cantidad_productos || "0",
        v.vendedor_nombre || "Admin",
        totalFormateado,
        v.metodo_pago || "No especificado"
      ];
    });
    
    // Agregar una fila de totales al final
    const totalVentas = ventasFiltradas.reduce((sum, venta) => sum + (venta.total || 0), 0);
    const cantidadTotal = ventasFiltradas.reduce((sum, venta) => sum + (venta.cantidad_productos || 0), 0);
    
    rows.push([
      "", 
      "", 
      `Total: ${ventasFiltradas.length} ventas`,
      `${cantidadTotal} productos`,
      "",
      `$${totalVentas.toLocaleString('es-AR')}`,
      ""
    ]);
    
    // Escapar valores que puedan contener comas
    const escaparCSV = (valor) => {
      if (typeof valor === 'string' && (valor.includes(',') || valor.includes('"') || valor.includes('\n'))) {
        return `"${valor.replace(/"/g, '""')}"`;
      }
      return valor;
    };
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(escaparCSV).join(","))
    ].join("\n");
    
    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_ventas_${desdeFormatted}_a_${hastaFormatted}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`CSV generado con ${ventasFiltradas.length} registros entre ${desde} y ${hasta}`);
  };

  // Manejar click en ver detalles
  const handleVerDetalle = (venta) => {
    // Aquí se podría implementar lógica para mostrar un modal con detalles
  };

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
      <div className="ventas-historicas-content">
        <div className="ventas-historicas-header">
          <h1 className="dashboard-title">Ventas Históricas</h1>
          <HeaderUserBar />
        </div>
        
        <div className="ventas-historicas-search-container">
          <div className="ventas-historicas-search-row">
            <Buscador 
              value={busqueda} 
              onChange={handleBusquedaChange}
              placeholder="Buscar en todas las columnas..." 
            />
            
            <BuscadorPorFechas
              desde={desde}
              hasta={hasta}
              onChangeDesde={setDesde}
              onChangeHasta={setHasta}
              mostrarDescarga={rangoActivo && !!(desde && hasta)}
              onBuscar={handleBuscar}
              onDescargarCSV={handleDescargarCSV}
            />
            
            {/* Botón para limpiar filtros - colocado a la derecha del BuscadorPorFechas */}
            {(busqueda || rangoActivo) && (
              <button 
                className="ventas-historicas-clear-filters" 
                onClick={() => {
                  // Limpiar todos los filtros
                  setRangoActivo(false);
                  setBusqueda('');
                  setDesde('');
                  setHasta('');
                }}
              >
                Limpiar filtros 🔄
              </button>
            )}
          </div>
        </div>
        
        {status === "loading" ? (
          <div className="ventas-historicas-loading">Cargando ventas...</div>
        ) : status === "failed" ? (
          <div className="ventas-historicas-error">Error al cargar ventas.</div>
        ) : (
          <VentasHistoricasTable 
            ventasFiltradas={ventasFiltradas} 
            onVerDetalle={handleVerDetalle} 
          />
        )}
      </div>
    </div>
  );
};

export default VentasHistoricasPage;
