import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDetalleVentas } from "../../store/detalleVentasSlice";
import { fetchProductos } from "../../store/productosSlice";
import "./TopMasVendidos.css";

const TopMasVendidos = ({ fechaInicio, fechaFin }) => {
  const dispatch = useDispatch();
  const { items: detalles, status: statusDetalles } = useSelector((state) => state.detalleVentas);
  const { items: productos, status: statusProductos } = useSelector((state) => state.productos);

  useEffect(() => {
    if (statusDetalles === "idle") dispatch(fetchDetalleVentas());
    if (statusProductos === "idle") dispatch(fetchProductos());
  }, [dispatch, statusDetalles, statusProductos]);

  // Filtrar por rango de fechas si se provee (requiere info de ventas)
  // Por ahora, ranking global

  // Sumar cantidades por producto
  const ranking = {};
  detalles.forEach((d) => {
    if (!ranking[d.producto_id]) ranking[d.producto_id] = 0;
    ranking[d.producto_id] += d.cantidad;
  });

  // Ordenar y tomar top 5
  const top = Object.entries(ranking)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([producto_id, cantidad]) => {
      const prod = productos.find((p) => p.id === Number(producto_id));
      return {
        id: producto_id,
        nombre: prod ? prod.nombre : `Producto ${producto_id}`,
        talle: prod ? prod.talle : "-",
        cantidad,
      };
    });

  return (
    <div className="top-mas-vendidos-card">
      <div className="top-mas-vendidos-header">
        <span className="top-mas-vendidos-icon" role="img" aria-label="Top">🏆</span>
        <div className="top-mas-vendidos-header-content">
          <h2 className="top-mas-vendidos-title">Top más vendidos</h2>
        </div>
        <button className="top-mas-vendidos-action" title="Ver todos">
          Ver todos <span className="arrow">→</span>
        </button>
      </div>
      <div className="top-mas-vendidos-list-header">
        <span></span>
        <span></span>
        <span className="top-mas-vendidos-cantidad-label-header">Unidades</span>
      </div>
      <div className="top-mas-vendidos-list">
        {top.map((item, idx) => (
          <div className="top-mas-vendidos-item" key={item.id}>
            <div className="top-mas-vendidos-img">
              <span role="img" aria-label="img">🖼️</span>
            </div>
            <div className="top-mas-vendidos-info">
              <span className="top-mas-vendidos-nombre">{item.nombre} Talle {item.talle}</span>
            </div>
            <div className="top-mas-vendidos-cantidad-num">{item.cantidad}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopMasVendidos;
