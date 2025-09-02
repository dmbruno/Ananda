import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchVentas } from "../../store/ventasSlice";
import { exportarVentasAExcel } from "../../utils/exportarExcel";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "./GraficoVentas.css";
import BuscadorPorFechas from "../Buscador/BuscadorPorFechas";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraficoVentas = ({ fechaInicio, fechaFin, showBuscadorPorFechas = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: ventas, status } = useSelector((state) => state.ventas);
  // Obtener información del usuario desde Redux
  const user = useSelector(state => state.auth.user);
  const isAdmin = user && user.is_admin === true;
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchVentas());
    }
  }, [dispatch, status]);

  // Definir filtroDesde y filtroHasta en el scope principal
  const filtroDesde = showBuscadorPorFechas ? desde : fechaInicio;
  const filtroHasta = showBuscadorPorFechas ? hasta : fechaFin;

  // Generar array de fechas entre dos fechas (inclusive)
  function getDateRangeArray(start, end) {
    const arr = [];
    let dt = new Date(start);
    const endDt = new Date(end);
    while (dt <= endDt) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }
    return arr;
  }

  // Procesar datos según rango seleccionado o últimos 10 días
  const getRangoData = () => {
    let ventasFiltradas = ventas;
    let days = [];
    if (filtroDesde && filtroHasta) {
      const inicio = new Date(filtroDesde);
      const fin = new Date(filtroHasta);
      ventasFiltradas = ventas.filter((venta) => {
        const fecha = venta.fecha_venta?.split("T")[0];
        return fecha >= inicio.toISOString().split('T')[0] && fecha <= fin.toISOString().split('T')[0];
      });
      days = getDateRangeArray(inicio, fin).map((d) => ({
        date: d.toISOString().split("T")[0],
        total: 0,
      }));
    } else {
      // Últimos 10 días por defecto
      const today = new Date();
      for (let i = 9; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        days.push({
          date: d.toISOString().split("T")[0],
          total: 0,
        });
      }
      ventasFiltradas = ventas.filter((venta) => {
        const fecha = venta.fecha_venta?.split("T")[0];
        return days.some((d) => d.date === fecha);
      });
    }
    // Sumar ventas por día
    ventasFiltradas.forEach((venta) => {
      const fecha = venta.fecha_venta?.split("T")[0];
      const day = days.find((d) => d.date === fecha);
      if (day) {
        day.total += venta.total;
      }
    });
    return days;
  };

  const datos = getRangoData();
  const totalVentas = datos.reduce((sum, d) => sum + d.total, 0);

  const chartData = {
    labels: datos.map((d) => {
      const [yyyy, mm, dd] = d.date.split("-");
      return `${dd}/${mm}`;
    }),
    datasets: [
      {
        label: filtroDesde && filtroHasta ? `Ventas diarias` : "Últimos 10 días",
        data: datos.map((d) => d.total),
        fill: true,
        borderColor: "#5A6ACF",
        backgroundColor: "rgba(90, 106, 207, 0.12)",
        pointBackgroundColor: "#5A6ACF",
        pointBorderColor: "#fff",
        tension: 0.35,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: true, color: '#e5e7eb', lineWidth: 1 },
        ticks: {
          color: "#9CA3AF",
          font: { size: 11, family: 'Rajdhani, Arial, sans-serif' },
        },
      },
      y: {
        grid: { display: true, color: '#e5e7eb', lineWidth: 1 },
        ticks: {
          display: false,
          font: { size: 11, family: 'Rajdhani, Arial, sans-serif' },
        },
      },
    },
  };

  if (status === "loading") return <div className="grafico-loading">Cargando ventas...</div>;
  if (status === "failed") return <div className="grafico-error">Error al cargar ventas</div>;

  // Mostrar botón de descarga si hay fechas seleccionadas
  const mostrarDescarga = !!(filtroDesde && filtroHasta);

  // Función para manejar la descarga de ventas
  const handleDescargarVentas = () => {
    // Verificar si el usuario es administrador
    if (!isAdmin) {
      // Mostrar una notificación si no es administrador
      alert("Solo los administradores pueden descargar reportes de ventas.");
      return;
    }
    
    // Si es administrador, proceder con la descarga
    if (filtroDesde && filtroHasta) {
      const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
      const nombreArchivo = `ventas-${filtroDesde}-al-${filtroHasta}-${fecha}.xlsx`;
      exportarVentasAExcel(datos, nombreArchivo);
      // Limpiar los campos después de la descarga
      setDesde("");
      setHasta("");
    }
  };

  return (
    <div className="grafico-ventas-card">
      <div className="grafico-ventas-header">
        <div className="grafico-ventas-header-content">
          <h2 className="grafico-ventas-amount">Ventas ${totalVentas.toLocaleString()}</h2>
          <p className="grafico-ventas-subtitle">{(filtroDesde && filtroHasta) ? `Del ${filtroDesde} al ${filtroHasta}` : "Ultimos 10 días"}</p>
        </div>
        {showBuscadorPorFechas ? (
          <div className="ultimos-vendidos-buscador">
            <BuscadorPorFechas
              desde={desde}
              hasta={hasta}
              onChangeDesde={setDesde}
              onChangeHasta={setHasta}
              onBuscar={() => {}}
              onDescargarCSV={handleDescargarVentas}
              mostrarDescarga={mostrarDescarga}
            />
          </div>
        ) : (
          <button 
            className="grafico-ventas-action" 
            title="Ver ventas"
            onClick={() => navigate('/ventas')}
          >
            Ventas <span className="arrow">→</span>
          </button>
        )}
      </div>
      <div className="grafico-ventas-chart-container">
        <Line data={chartData} options={chartOptions} height={224} />
      </div>
    </div>
  );
};

export default GraficoVentas;
