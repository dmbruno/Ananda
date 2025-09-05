import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { aplicarAjusteMasivo, fetchProductos, resetAjusteMasivoStatus } from '../../store/productosSlice';
import { fetchCategorias } from '../../store/categoriasSlice';
import BotonEnviar from '../Botones/BotonEnviar';
import BotonCancelar from '../Botones/BotonCancelar';
import notify from '../../utils/notify';
import './ModalAjustePrecios.css';

const ModalAjustePrecios = ({ open, onClose, modoStockFecha, categoriaActual, subcategoriaActual }) => {
  const dispatch = useDispatch();
  const { categorias } = useSelector(state => state.categorias);
  const { items: productos, ajusteMasivoStatus, ajusteMasivoError, ajusteMasivoMensaje } = useSelector(state => state.productos);
  
  // Validar y registrar los props recibidos
  console.log("ModalAjustePrecios props:", { 
    open, 
    modoStockFecha, 
    categoriaActual: categoriaActual ? {
      id: categoriaActual.id,
      nombre: categoriaActual.nombre,
      tipo: typeof categoriaActual.id
    } : null, 
    subcategoriaActual: subcategoriaActual ? {
      id: subcategoriaActual.id,
      nombre: subcategoriaActual.nombre,
      tipo: typeof subcategoriaActual.id
    } : null,
    totalProductos: productos.length
  });
  
  // Productos filtrados según el contexto actual (memoizados)
  const productosFiltrados = React.useMemo(() => {
    console.log("Filtrando productos con:", {
      categoriaActualNombre: categoriaActual?.nombre,
      subcategoriaActualNombre: subcategoriaActual?.nombre,
      productosTotal: productos.length
    });
    
    // Vamos a usar la misma lógica de filtrado que usa StockPage.jsx
    // Esto asegura consistencia entre lo que ve el usuario en la tabla y lo que afecta el modal
    try {
      // Si estamos en modo stock a la fecha, no filtramos por categoría o subcategoría
      if (modoStockFecha) {
        console.log("Modo stock a la fecha: mostrando todos los productos");
        return productos;
      }
      
      // Filtramos por categoría y subcategoría exactamente como lo hace StockPage
      return productos.filter(producto => {
        // Comprobar si el producto coincide con la categoría actual
        const coincideCategoria = !categoriaActual?.nombre || 
          producto.categoria_nombre?.toLowerCase() === categoriaActual.nombre?.toLowerCase();
        
        // Comprobar si el producto coincide con la subcategoría actual
        const coincideSubcategoria = !subcategoriaActual?.nombre || 
          producto.subcategoria_nombre?.toLowerCase() === subcategoriaActual.nombre?.toLowerCase();
        
        // Solo incluir productos que coincidan tanto con la categoría como con la subcategoría (si está especificada)
        return coincideCategoria && coincideSubcategoria;
      });
    } catch (error) {
      console.error("Error al filtrar productos:", error);
      return productos; // En caso de error, mostrar todos los productos es más seguro que limitar arbitrariamente
    }
  }, [productos, categoriaActual, subcategoriaActual, modoStockFecha]);
  
  // Estado para controlar la animación de salida
  const [exiting, setExiting] = useState(false);
  const timeoutRef = useRef();
  
  // Estados para el formulario
  const [tipoAjuste, setTipoAjuste] = useState('porcentaje');
  const [valorAjuste, setValorAjuste] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [subcategorias, setSubcategorias] = useState([]);
  const [subcategoriaId, setSubcategoriaId] = useState('');
  
  // Estado para controlar las animaciones del botón
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonSuccess, setButtonSuccess] = useState(false);
  
  // El alcance ahora se determina automáticamente por el contexto actual
  const alcance = modoStockFecha ? 'todos' : 
                 (subcategoriaActual?.id ? 'subcategoria' : 
                 (categoriaActual?.id ? 'categoria' : 'todos'));
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    dispatch(fetchCategorias());
  }, [dispatch]);
  
  // Actualizar subcategorías cuando cambia la categoría
  useEffect(() => {
    if (categoriaId) {
      const categoriaSeleccionada = categorias.find(c => c.id.toString() === categoriaId);
      if (categoriaSeleccionada && categoriaSeleccionada.subcategorias) {
        setSubcategorias(categoriaSeleccionada.subcategorias);
      } else {
        setSubcategorias([]);
      }
    } else {
      setSubcategorias([]);
    }
    setSubcategoriaId('');
  }, [categoriaId, categorias]);
  
  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (open) {
      setExiting(false);
      setTipoAjuste('porcentaje');
      setValorAjuste('');
      // Resetear los estados del botón
      setButtonLoading(false);
      setButtonSuccess(false);
      
      // Debug - Ver qué datos tenemos disponibles
      console.log('Modal abierto con los siguientes datos:');
      console.log('Modo Stock Fecha:', modoStockFecha);
      console.log('Categoría actual:', categoriaActual);
      console.log('Subcategoría actual:', subcategoriaActual);
      console.log('Total productos cargados:', productos.length);
      
      if (categoriaActual && categoriaActual.id) {
        const prodsCat = productos.filter(p => String(p.categoria_id) === String(categoriaActual.id));
        console.log(`Productos en categoría "${categoriaActual.nombre}":`, prodsCat.length);
      }
      
      if (subcategoriaActual && subcategoriaActual.id) {
        const prodsSub = productos.filter(p => String(p.subcategoria_id) === String(subcategoriaActual.id));
        console.log(`Productos en subcategoría "${subcategoriaActual.nombre}":`, prodsSub.length);
      }
      
      // Establecer los IDs automáticamente basado en el contexto
      if (modoStockFecha) {
        // En modo stock a la fecha, aplicamos a todos los productos
        setCategoriaId('');
        setSubcategoriaId('');
      } else if (subcategoriaActual && subcategoriaActual.id) {
        // Si estamos en una vista de subcategoría
        setCategoriaId(categoriaActual?.id?.toString() || '');
        setSubcategoriaId(subcategoriaActual.id.toString());
      } else if (categoriaActual && categoriaActual.id) {
        // Si estamos en una vista de categoría
        setCategoriaId(categoriaActual.id.toString());
        setSubcategoriaId('');
      } else {
        // Por defecto
        setCategoriaId('');
        setSubcategoriaId('');
      }
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open, modoStockFecha, categoriaActual, subcategoriaActual]);
  
  // Solo restablecer el estado cuando se desmonta el componente
  useEffect(() => {
    return () => {
      // Limpiar el estado cuando se desmonta el componente
      if (ajusteMasivoStatus !== 'idle') {
        dispatch(resetAjusteMasivoStatus());
      }
      setButtonLoading(false);
      setButtonSuccess(false);
    };
  }, [ajusteMasivoStatus, dispatch]);
  
  // Función para manejar el cierre con animación
  const handleClose = () => {
    setExiting(true);
    setButtonLoading(false);
    setButtonSuccess(false);
    timeoutRef.current = setTimeout(() => {
      setExiting(false);
      onClose();
    }, 450);
  };
  
  // Calcular la cantidad de productos afectados según el contexto actual
  const getProductosAfectados = () => {
    const count = productosFiltrados.length;
    console.log('getProductosAfectados:', { 
      modoStockFecha, 
      categoriaNombre: categoriaActual?.nombre, 
      subcategoriaNombre: subcategoriaActual?.nombre, 
      totalProductos: productos.length,
      productosAfectados: count,
      productosFiltradosIds: productosFiltrados.map(p => p.id)
    });
    return count;
  };
  
  // Ya no necesitamos estas funciones porque usamos directamente categoriaActual y subcategoriaActual
  
  // Obtener un texto descriptivo del contexto actual
  const getContextoDescripcion = () => {
    if (modoStockFecha) {
      return "Todos los productos";
    } else if (subcategoriaActual?.nombre && categoriaActual?.nombre) {
      return `Productos de la categoría "${categoriaActual.nombre}" > subcategoría "${subcategoriaActual.nombre}"`;
    } else if (categoriaActual?.nombre) {
      return `Productos de la categoría "${categoriaActual.nombre}"`;
    }
    return "Productos";
  };
  
  const handleSubmit = (e) => {
    console.log("Función handleSubmit iniciada");
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // No proceder si no hay valor de ajuste o si está en proceso
    if (!valorAjuste || ajusteMasivoStatus === 'loading') {
      console.log("No se puede proceder: valor ajuste vacío o ya está en proceso", {valorAjuste, ajusteMasivoStatus});
      return;
    }
    
    // Siempre vamos a usar productos_especificos con los IDs filtrados correctamente
    const ajusteData = {
      tipo_ajuste: tipoAjuste,
      valor_ajuste: parseFloat(valorAjuste),
      alcance: 'productos_especificos'
    };
    
    // Usar los IDs de los productos filtrados según nuestro useMemo actualizado
    const productosIds = productosFiltrados.map(p => p.id);
    ajusteData.productos_ids = productosIds;
    
    // Logs informativos según el contexto
    if (subcategoriaActual && subcategoriaActual.nombre) {
      console.log("Ajustando productos específicos de subcategoría:", { 
        subcategoria_nombre: subcategoriaActual.nombre,
        categoria_nombre: categoriaActual?.nombre,
        productos_afectados: productosIds.length,
        productos_ids: productosIds
      });
    } else if (categoriaActual && categoriaActual.nombre) {
      console.log("Ajustando productos específicos de categoría:", { 
        categoria_nombre: categoriaActual.nombre,
        productos_afectados: productosIds.length,
        productos_ids: productosIds
      });
    } else {
      console.log("Ajustando todos los productos:", {
        productos_afectados: productosIds.length,
        productos_ids: productosIds
      });
    }
    
    // Simulación de cómo se verían los precios después del ajuste (solo para debug)
    console.log("Previsualización de ajuste:");
    productosFiltrados.forEach(producto => {
      const precioOriginal = producto.precio_venta;
      let precioNuevo;
      
      if (tipoAjuste === 'porcentaje') {
        precioNuevo = precioOriginal * (1 + parseFloat(valorAjuste) / 100);
      } else { // monto
        precioNuevo = precioOriginal + parseFloat(valorAjuste);
      }
      
      console.log(`Producto ${producto.id} (${producto.nombre}): $${precioOriginal} → $${precioNuevo.toFixed(2)}`);
    });
    
    // Log detallado de los datos que se enviarán
    console.log("Enviando datos de ajuste a la API:", {
      ...ajusteData,
      productosAfectados: productosFiltrados.length,
      productosFiltradosIds: productosFiltrados.map(p => p.id)
    });
    
    // Activar estado de carga del botón
    setButtonLoading(true);
    
    // Llamada a la API para aplicar el ajuste
    dispatch(aplicarAjusteMasivo(ajusteData))
      .unwrap()
      .then((response) => {
        console.log("✅ Respuesta exitosa de la API:", response);
        
        // Recargar productos inmediatamente para que estén disponibles cuando se cierre el modal
        dispatch(fetchProductos())
          .unwrap()
          .then(() => {
            console.log("✅ Productos recargados exitosamente después del ajuste");
            
            // Mostrar animación de éxito
            setButtonLoading(false);
            setButtonSuccess(true);
            
            // Mostrar alert de confirmación con información detallada
            setTimeout(() => {
              const mensaje = tipoAjuste === 'porcentaje' 
                ? `¡Precios actualizados! Se ha incrementado un ${valorAjuste}% el precio de ${productosFiltrados.length} productos.`
                : `¡Precios actualizados! Se ha incrementado $${valorAjuste} al precio de ${productosFiltrados.length} productos.`;
                
              notify.info(mensaje);
              handleClose();
            }, 800);
          })
          .catch(error => {
            console.error("❌ Error al recargar productos:", error);
            setButtonLoading(false);
            notify.warn("Los precios se han actualizado pero ocurrió un error al recargar la página. Por favor, actualice manualmente.");
          });
      })
      .catch((error) => {
        console.error("❌ Error al ajustar precios:", error);
        setButtonLoading(false);
        notify.error("Error al ajustar los precios. Por favor, intente nuevamente.");
      });
  };
  
  if (!open && !exiting) return null;
  
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className={`modal-content modal-ajuste-precios${exiting ? " modal-exit" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ajuste Masivo de Precios</h2>
          <button className="modal-close" onClick={handleClose}>&times;</button>
        </div>
        
        {/* Panel de resumen e información */}
        <div className="modal-info-panel">
          <div className="modal-contexto">
            <h3>Información del ajuste</h3>
            <p>
              <span className="contexto-label">Contexto actual:</span> 
              <span className="contexto-valor">{getContextoDescripcion()}</span>
            </p>
            <hr className="info-divider" />
            <p className="productos-afectados">
              El ajuste se aplicará a <strong>{getProductosAfectados()}</strong> productos en total.
            </p>
            
            <div className="contexto-detalle">
              {/* Para el caso 'modoStockFecha' ya mostramos el total en la línea principal arriba
                  y evitamos repetirlo aquí. */}
               
               {subcategoriaActual && subcategoriaActual.id && (
                 <>
                   <p>
                     <span className="detalle-label">Categoría:</span> 
                     <span className="detalle-valor">{categoriaActual?.nombre || 'Seleccionada'}</span>
                   </p>
                   <p>
                     <span className="detalle-label">Subcategoría:</span> 
                     <span className="detalle-valor">{subcategoriaActual.nombre || 'Seleccionada'}</span>
                   </p>
                   <p>El ajuste se aplicará a <strong>{productosFiltrados.length}</strong> productos de esta subcategoría.</p>
                 </>
               )}
               
               {categoriaActual && categoriaActual.id && !subcategoriaActual && (
                 <>
                   <p>
                     <span className="detalle-label">Categoría:</span> 
                     <span className="detalle-valor">{categoriaActual.nombre || 'Seleccionada'}</span>
                   </p>
                   <p>El ajuste se aplicará a <strong>{productosFiltrados.length}</strong> productos de esta categoría.</p>
                 </>
               )}
               
               {/* En el caso 'todos' ya mostramos el total en la línea principal; no repetir aquí */}
             </div>
          </div>
        </div>
        
        {ajusteMasivoStatus === 'succeeded' ? (
          <div className="modal-success-message">
            <span className="success-icon">✅</span>
            <p>{ajusteMasivoMensaje}</p>
            <p>La ventana se cerrará automáticamente...</p>
          </div>
        ) : (
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label>Tipo de Ajuste:</label>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="tipoAjuste" 
                    value="porcentaje" 
                    checked={tipoAjuste === 'porcentaje'} 
                    onChange={() => setTipoAjuste('porcentaje')} 
                  /> 
                  Porcentaje (%)
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="tipoAjuste" 
                    value="monto" 
                    checked={tipoAjuste === 'monto'} 
                    onChange={() => setTipoAjuste('monto')} 
                  /> 
                  Monto ($)
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label>
                {tipoAjuste === 'porcentaje' ? 'Porcentaje de incremento:' : 'Monto a incrementar:'}
              </label>
              <div className="input-with-symbol">
                <input
                  type="number"
                  value={valorAjuste}
                  onChange={e => setValorAjuste(e.target.value)}
                  step="0.01"
                  min="0.01"
                  required
                  placeholder={tipoAjuste === 'porcentaje' ? "Ej: 10 para 10%" : "Ej: 100 para $100"}
                />
                <span className="input-symbol">{tipoAjuste === 'porcentaje' ? '%' : '$'}</span>
              </div>
              
            </div>
            
            <div className="form-group info-panel">
              
              <div className="context-info">
                {/* Para 'modoStockFecha' el total ya se muestra en el encabezado; evitar duplicado */}
                
                {subcategoriaActual && subcategoriaActual.id && (
                  <p>
                    Categoría: {categoriaActual?.nombre || 'Seleccionada'} <br/>
                    Subcategoría: {subcategoriaActual.nombre || 'Seleccionada'} <br/>
                    ({productosFiltrados.length} productos)
                  </p>
                )}
                
                {categoriaActual && categoriaActual.id && !subcategoriaActual && (
                  <p>
                    Categoría: {categoriaActual.nombre || 'Seleccionada'} <br/>
                    ({productosFiltrados.length} productos)
                  </p>
                )}

                {/* El caso "todos" está cubierto en el encabezado */}
              </div>
            </div>
            
            {valorAjuste && (
              <div className="resumen-ajuste">
                <p>
                  <span className="resumen-icono">✓</span> Has seleccionado{' '}
                  {tipoAjuste === 'porcentaje' ? (
                    <strong>incrementar un {valorAjuste}% el precio</strong>
                  ) : (
                    <strong>incrementar ${valorAjuste} al precio</strong>
                  )}{' '}
                  de <strong>{productosFiltrados.length} productos</strong> en total.
                </p>
              </div>
            )}
            
            {ajusteMasivoError && (
              <div className="error-message">
                <p>{ajusteMasivoError}</p>
              </div>
            )}
            
            <div className="form-actions">
              <BotonCancelar 
                onClick={handleClose}
                disabled={buttonLoading}
              >
                Cancelar
              </BotonCancelar>
              <BotonEnviar 
                onClick={(e) => {
                  console.log("Botón Aplicar Ajuste clickeado");
                  console.log("Estado actual:", { ajusteMasivoStatus, valorAjuste });
                  if (ajusteMasivoStatus !== 'loading' && valorAjuste && !buttonLoading && !buttonSuccess) {
                    console.log("Condiciones cumplidas, ejecutando handleSubmit");
                    handleSubmit(e);
                  } else {
                    console.log("No se cumplieron las condiciones para enviar");
                  }
                }}
                loading={buttonLoading}
                success={buttonSuccess}
              >
                {buttonLoading ? 'Aplicando...' : buttonSuccess ? '' : 'Aplicar Ajuste'}
              </BotonEnviar>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalAjustePrecios;
