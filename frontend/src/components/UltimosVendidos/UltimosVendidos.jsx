import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchVentas } from "../../store/ventasSlice";
import "./UltimosVendidos.css";
import BuscadorPorFechas from "../Buscador/BuscadorPorFechas";
import ModalVerVenta from "../Modals/ModalVerVenta";

const metodoPagoLabel = {
  "TC": "Tarjeta",
  "TB": "Transferencia",
  "FT": "Efectivo",
  "EF": "Efectivo"
};

const UltimosVendidos = () => {
  const dispatch = useDispatch();
  const { items: ventas, status } = useSelector((state) => state.ventas);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [modalVentaActiva, setModalVentaActiva] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchVentas());
    }
  }, [dispatch, status]);

  // Si hay filtro, mostrar solo ese rango; si no, mostrar últimos 5 días
  let ventasFiltradas = [];
  let filtroActivo = false;
  if (desde && hasta) {
    filtroActivo = true;
    const inicio = new Date(desde).toISOString().split('T')[0];
    const fin = new Date(hasta).toISOString().split('T')[0];
    ventasFiltradas = ventas.filter((venta) => {
      const fecha = venta.fecha_venta?.split("T")[0];
      return fecha >= inicio && fecha <= fin;
    });
  } else {
    // Últimos 5 días
    const hoy = new Date();
    const dias = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);
      dias.push(d.toISOString().split('T')[0]);
    }
    ventasFiltradas = ventas.filter((venta) => {
      const fecha = venta.fecha_venta?.split("T")[0];
      return dias.includes(fecha);
    });
  }
  // Ordenar ventas por fecha descendente
  ventasFiltradas.sort((a, b) => new Date(b.fecha_venta) - new Date(a.fecha_venta));

  // CSV export logic
  const handleDescargarCSV = () => {
    const encabezado = ["Fecha/Hora", "Cliente", "Productos", "Total", "Método de pago"];
    const filas = ventasFiltradas.map((venta) => [
      venta.fecha_venta
        ? new Date(venta.fecha_venta).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
        : "-",
      venta.cliente_nombre || "-",
      venta.cantidad_productos || "0",
      venta.total ? venta.total.toLocaleString("es-AR") : "-",
      metodoPagoLabel[venta.metodo_pago] || venta.metodo_pago || "-"
    ]);
    const csvContent = [encabezado, ...filas].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "ventas_filtradas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular si el rango supera los 5 días
  let diasRango = 0;
  let mostrarDescarga = false;
  if (desde && hasta) {
    const d1 = new Date(desde);
    const d2 = new Date(hasta);
    diasRango = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24)) + 1;
    mostrarDescarga = diasRango > 5;
  }

  return (
    <div className="ultimos-vendidos-card">
      <div className="ultimos-vendidos-header">
        <h2 className="ultimos-vendidos-title">Ultimos vendidos</h2>
        <div className="ultimos-vendidos-buscador">
          <BuscadorPorFechas
            desde={desde}
            hasta={hasta}
            onChangeDesde={setDesde}
            onChangeHasta={setHasta}
            mostrarDescarga={mostrarDescarga}
            onDescargarCSV={() => {
              handleDescargarCSV();
              setDesde("");
              setHasta("");
            }}
          />
        </div>
        <button className="ultimos-vendidos-action" title="Ver historial">
          Histórico <span className="arrow">→</span>
        </button>
      </div>
      <div className="ultimos-vendidos-table">
        <div className="ultimos-vendidos-table-header">
          <span>Fecha/Hora</span>
          <span>Cliente</span>
          <span>Productos</span>
          <span>Total</span>
          <span>Método de pago</span>
        </div>
        {ventasFiltradas.map((venta, idx) => (
          <div 
            className="ultimos-vendidos-table-row" 
            key={venta.id + '-' + (venta.fecha_venta || '') + '-' + idx}
            onClick={() => {
              setVentaSeleccionada(venta);
              setModalVentaActiva(true);
            }}
          >
            <span>{
              venta.fecha_venta
                ? new Date(venta.fecha_venta).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
                : "-"
            }</span>
            <span>{venta.cliente_nombre || "-"}</span>
            <span>{venta.cantidad_productos || "0"}</span>
            <span>${venta.total ? venta.total.toLocaleString("es-AR") : "-"}</span>
            <span>{metodoPagoLabel[venta.metodo_pago] || venta.metodo_pago || "-"}</span>
          </div>
        ))}
      </div>
      {modalVentaActiva && ventaSeleccionada && (
        <ModalVerVenta 
          venta={ventaSeleccionada} 
          onClose={() => setModalVentaActiva(false)} 
        />
      )}
    </div>
  );
};

export default UltimosVendidos;
