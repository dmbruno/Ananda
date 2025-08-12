import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductos } from '../store/productosSlice';
import Sidebar from '../components/Sidebar/sidebar';
import HeaderUserBar from '../components/HeaderUserBar/HeaderUserBar';
import TablaStock from '../components/TablaStock/TablaStock';
import { exportarStockAExcel } from '../utils/exportarExcel';

import BotonCustom from '../components/Botones/BotonCustom';

import ModalNuevoProducto from '../components/Modals/ModalNuevoProducto';
import './StockPage.css';

const StockPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { subcategoria: subcategoriaParam } = useParams();
  const { categoria, subcategoria, subcategoriaId, categoriaId } = location.state || {};

  // Redux state
  const { items: productos, status, error } = useSelector(state => state.productos);
  const loading = status === 'loading';

  const subcategoriaFinal = subcategoria || subcategoriaParam?.replace(/-/g, ' ').replace(/y/g, '&');
  const categoriaFinal = categoria || 'Categoría';

  // Estado para modo stock a la fecha
  const [modoStockFecha, setModoStockFecha] = useState(false);
  // Estado para modal nuevo producto
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);

  // Fetch productos al montar el componente
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProductos());
    }
  }, [dispatch, status]);


 
  

  const productosParaMostrar = modoStockFecha 
    ? productos // Mostrar todos los productos
    : productos.filter(producto => {
        // Filtrar por categoría y subcategoría si están definidas
        const coincideCategoria = !categoriaFinal || categoriaFinal === 'Categoría' || 
          producto.categoria_nombre?.toLowerCase() === categoriaFinal.toLowerCase();
        const coincideSubcategoria = !subcategoriaFinal || 
          producto.subcategoria_nombre?.toLowerCase() === subcategoriaFinal.toLowerCase();
        return coincideCategoria && coincideSubcategoria;
      });

  console.log("Productos mostrados en la tabla después de filtrar:", productosParaMostrar); // Log para depurar

  // Función para exportar a Excel
  const handleExportarExcel = () => {
    const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    const nombreArchivo = modoStockFecha 
      ? `stock-completo-${fecha}.xlsx`
      : `stock-${categoriaFinal}-${subcategoriaFinal}-${fecha}.xlsx`;
    exportarStockAExcel(productosParaMostrar, nombreArchivo);
  };

  return (
    <div className="stock-page">
      <Sidebar />
      <div className="stock-page-content">
        <HeaderUserBar />
        <div className="stock-page-main">
          {/* Header con Breadcrumbs y Botones en la misma línea */}
          <div className="stock-header">
            <div className="stock-breadcrumbs">
              <h1 className="stock-title">
                {modoStockFecha 
                  ? "📦 STOCK TOTAL A LA FECHA" 
                  : `📦 STOCK DE > ${categoriaFinal?.toUpperCase()} > ${subcategoriaFinal?.toUpperCase()}`
                }
              </h1>
            </div>

            {/* Botones de acción */}
            <div className="stock-actions">
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

              {/* Botón de exportar a Excel solo en modo stock a la fecha */}
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
                >
                  Exportar Excel
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
      </div>
    </div>
  );
};

export default StockPage;
