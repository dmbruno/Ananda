import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDetalleVentas } from "../../store/detalleVentasSlice";
import { fetchProductos } from "../../store/productosSlice";
import "./TopMasVendidos.css";
import BuscadorPorFechas from "../Buscador/BuscadorPorFechas";

const TopMasVendidos = ({ showSmallImage = false, showBuscadorPorFechas = false }) => {
  // Estado para fechas y rango activo
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [rangoActivo, setRangoActivo] = useState(false); // true si el usuario buscó un rango
  const dispatch = useDispatch();
  const { items: detalles, status: statusDetalles } = useSelector((state) => state.detalleVentas);
  const { items: productos, status: statusProductos } = useSelector((state) => state.productos);

  useEffect(() => {
    if (statusDetalles === "idle") dispatch(fetchDetalleVentas());
    if (statusProductos === "idle") dispatch(fetchProductos());
  }, [dispatch, statusDetalles, statusProductos]);

  // Inicializar fechas por defecto (últimos 3 meses)
  useEffect(() => {
    if (detalles.length > 0 && (!desde || !hasta)) {
      const hoy = new Date();
      const hace3Meses = new Date();
      hace3Meses.setMonth(hoy.getMonth() - 3);
      setDesde(hace3Meses.toISOString().split('T')[0]);
      setHasta(hoy.toISOString().split('T')[0]);
      setRangoActivo(false);
    }
  }, [detalles]);

  // Filtrar detalles según el rango activo o por defecto
  let detallesFiltrados = detalles;
  if (showBuscadorPorFechas && rangoActivo && desde && hasta) {
    // Asegurar formato YYYY-MM-DD en todas las comparaciones
    const desdeStr = typeof desde === 'string' ? desde : new Date(desde).toISOString().split('T')[0];
    const hastaStr = typeof hasta === 'string' ? hasta : new Date(hasta).toISOString().split('T')[0];
    console.log('DEBUG TopMasVendidos: desde input:', desde, 'hasta input:', hasta, 'desdeStr:', desdeStr, 'hastaStr:', hastaStr);
    detallesFiltrados = detalles.filter((d) => {
      if (!d.fecha_venta) return false;
      const fecha = typeof d.fecha_venta === 'string' ? d.fecha_venta.split('T')[0] : '';
      if (!fecha) return false;
      if (fecha >= desdeStr && fecha <= hastaStr) {
        console.log('DEBUG TopMasVendidos: venta incluida', {fecha, desdeStr, hastaStr, d});
      }
      return fecha >= desdeStr && fecha <= hastaStr;
    });
    if (detallesFiltrados.length === 0) {
      console.log('DEBUG TopMasVendidos: No hay ventas en el rango seleccionado. Detalles completos:', detalles);
      console.log('DEBUG TopMasVendidos: Todas las fechas_venta:', detalles.map(d => d.fecha_venta));
    }
  } else if (!showBuscadorPorFechas || (showBuscadorPorFechas && !rangoActivo)) {
    // Si no hay buscador o no se presionó la lupa, mostrar ranking por defecto
    if (detalles.length > 0) {
      const fechas = detalles
        .map((d) => {
          if (!d.fecha_venta) return null;
          const fecha = typeof d.fecha_venta === 'string' ? d.fecha_venta.split('T')[0] : '';
          return fecha ? new Date(fecha) : null;
        })
        .filter(Boolean)
        .sort((a, b) => a - b);
      if (fechas.length > 0) {
        const fechaMin = fechas[0];
        const hoy = new Date();
        const hace3Meses = new Date();
        hace3Meses.setMonth(hoy.getMonth() - 3);
        if (fechaMin < hace3Meses) {
          detallesFiltrados = detalles.filter((d) => {
            if (!d.fecha_venta) return false;
            const fecha = typeof d.fecha_venta === 'string' ? d.fecha_venta.split('T')[0] : '';
            if (!fecha) return false;
            const fechaVenta = new Date(fecha);
            return fechaVenta >= hace3Meses && fechaVenta <= hoy;
          });
        } else {
          detallesFiltrados = detalles;
        }
      }
    }
  }

  // Sumar cantidades por producto
  const ranking = {};
  detallesFiltrados.forEach((d) => {
    if (!ranking[d.producto_id]) ranking[d.producto_id] = 0;
    ranking[d.producto_id] += d.cantidad;
  });
  // Ordenar y tomar top 5 para mostrar
  const top = Object.entries(ranking)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([producto_id, cantidad]) => {
      const prod = productos.find((p) => p.id === Number(producto_id));
      return {
        id: producto_id,
        nombre: prod ? prod.nombre : `Producto ${producto_id}`,
        cantidad,
        imagen: prod && prod.imagen_url ? prod.imagen_url : null,
      };
    });

  // Exportar a CSV (solo si hay rango activo)
  const handleDescargarCSV = () => {
    const allRanking = {};
    detallesFiltrados.forEach((d) => {
      if (!allRanking[d.producto_id]) allRanking[d.producto_id] = 0;
      allRanking[d.producto_id] += d.cantidad;
    });
    const ordenados = Object.entries(allRanking)
      .sort((a, b) => b[1] - a[1])
      .map(([producto_id, cantidad]) => {
        const prod = productos.find((p) => p.id === Number(producto_id));
        return {
          Producto: prod ? prod.nombre : `Producto ${producto_id}`,
          Cantidad: cantidad
        };
      });
    const csv = ["Producto,Cantidad", ...ordenados.map(r => `${r.Producto},${r.Cantidad}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `top_mas_vendidos_${desde || ""}_${hasta || ""}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.alert("El reporte fue enviado para descarga");
  };

  return (
    <div className="top-mas-vendidos-card">
      <div className="top-mas-vendidos-header">
        <span className="top-mas-vendidos-icon" role="img" aria-label="Top">🏆</span>
        <div className="top-mas-vendidos-header-content">
          <h2 className="top-mas-vendidos-title">Top más vendidos</h2>
        </div>
        {showBuscadorPorFechas ? null : (
          <button className="top-mas-vendidos-action" title="Ver todos">
            Ver todos <span className="arrow">→</span>
          </button>
        )}
      </div>
      {showBuscadorPorFechas && (
        <div style={{ marginBottom: 4 }}>
          <BuscadorPorFechas
            desde={desde}
            hasta={hasta}
            onChangeDesde={setDesde}
            onChangeHasta={setHasta}
            mostrarDescarga={rangoActivo && !!(desde && hasta)}
            onBuscar={() => setRangoActivo(true)}
            onDescargarCSV={handleDescargarCSV}
          />
        </div>
      )}
      <div className="top-mas-vendidos-list ventas-top-list-scroll">
        <div className="top-mas-vendidos-list-header">
          <span></span>
          <span></span>
        </div>
        {top.length === 0 ? (
          <div className="ventas-top-item ventas-top-item-empty" style={{textAlign:'center', width:'100%', color:'#888', fontWeight:400, padding:'1.5rem 0'}}>
            No hay ventas en el rango seleccionado
          </div>
        ) : (
          top.map((item, idx) => (
            <div className="ventas-top-item" key={item.id}>
              <span className="ventas-top-pos">#{idx + 1}</span>
              <div className="ventas-top-img">
                {item.imagen ? (
                  <img src={item.imagen} alt={item.nombre} style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <span role="img" aria-label="img">🖼️</span>
                )}
              </div>
              <span className="ventas-top-nombre">{item.nombre}</span>
              <span className="ventas-top-cant">{item.cantidad} unidades</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TopMasVendidos;
