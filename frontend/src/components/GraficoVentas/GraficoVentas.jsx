import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchVentas } from "../../store/ventasSlice";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GraficoVentas = ({ fechaInicio, fechaFin }) => {
  const dispatch = useDispatch();
  const { items: ventas, status } = useSelector((state) => state.ventas);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchVentas());
    }
  }, [dispatch, status]);

  // Procesar los últimos 10 días o rango de fechas
  const getLastTenDaysData = () => {
    let ventasFiltradas = ventas;
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio).toISOString().split('T')[0];
      const fin = new Date(fechaFin).toISOString().split('T')[0];
      ventasFiltradas = ventas.filter((venta) => {
        const fecha = venta.fecha_venta?.split("T")[0];
        return fecha >= inicio && fecha <= fin;
      });
    }
    const today = new Date();
    const days = [];
    for (let i = 9; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push({
        date: d.toISOString().split("T")[0],
        label: `${d.getDate()}`,
        total: 0,
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

  const datos = getLastTenDaysData();
  const totalVentas = datos.reduce((sum, d) => sum + d.total, 0);

  const chartData = {
    labels: datos.map((d) => {
      const [yyyy, mm, dd] = d.date.split("-");
      return `${dd}/${mm}`;
    }),
    datasets: [
      {
        label: "Last 10 days",
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

  return (
    <div className="grafico-ventas-card">
      <div className="grafico-ventas-header">
        <div className="grafico-ventas-header-content">
          <h2 className="grafico-ventas-amount">Ventas ${totalVentas.toLocaleString()}</h2>
          <p className="grafico-ventas-subtitle">Ultimos 10 días</p>
        </div>
        <button className="grafico-ventas-action" title="Ver ventas">
          Ventas <span className="arrow">→</span>
        </button>
      </div>
      <div className="grafico-ventas-chart-container">
        <Line data={chartData} options={chartOptions} height={224} />
      </div>
    </div>
  );
};

export default GraficoVentas;
