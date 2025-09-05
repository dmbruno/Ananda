import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchVentas } from "../../store/ventasSlice";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import "./MetodoDePago.css";
import BuscadorPorFechas from "../Buscador/BuscadorPorFechas";

ChartJS.register(ArcElement, Tooltip, Legend);

const METODOS = {
  "EF": "Efectivo",
  "TC": "Tarjeta de Crédito",
  "TB": "Transferencia Bancaria"
};

const COLORS = ["#4F46E5", "#A5B4FC", "#818CF8"];

const MetodoDePago = ({ fechaInicio, fechaFin, className = "", chartWidth = 200, chartHeight = 200, showBuscadorPorFechas = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: ventas, status } = useSelector((state) => state.ventas);
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchVentas());
    }
  }, [dispatch, status]);

  // Filtrar ventas por rango de fechas si se proveen, si no, solo hoy
  let ventasFiltradas = ventas;
  if (desde && hasta) {
    const inicio = new Date(desde).toISOString().split('T')[0];
    const fin = new Date(hasta).toISOString().split('T')[0];
    ventasFiltradas = ventas.filter((venta) => {
      const fecha = (typeof venta.fecha_venta === 'string') ? venta.fecha_venta.split('T')[0] : '';
      return fecha >= inicio && fecha <= fin;
    });
  } else {
    const today = new Date().toISOString().split('T')[0];
    ventasFiltradas = ventas.filter((venta) => {
      const fecha = (typeof venta.fecha_venta === 'string') ? venta.fecha_venta.split('T')[0] : '';
      return fecha === today;
    });
  }

  // Contar ventas por método de pago SOLO del rango/fecha filtrada
  const counts = { FT: 0, TC: 0, TB: 0 };
  ventasFiltradas.forEach((venta) => {
    if (counts[venta.metodo_pago] !== undefined) {
      counts[venta.metodo_pago]++;
    }
  });
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const safePercent = (val) => (total > 0 ? Math.round((val / total) * 100) : 0);
  const data = {
    labels: ["TC", "TB", "FT"],
    datasets: [
      {
        data: [counts.TC, counts.TB, counts.FT],
        backgroundColor: COLORS,
        borderWidth: 0,
        cutout: "70%"
      }
    ]
  };

  const options = {
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#1f2937',
        bodyColor: '#1f2937',
        borderColor: '#4F46E5',
        borderWidth: 3,
        titleFont: { family: 'Rajdhani, Arial, sans-serif', size: 14, weight: 'bold' },
        bodyFont: { family: 'Rajdhani, Arial, sans-serif', size: 10 },
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = METODOS[context.label] || context.label;
            const value = context.parsed;
            const percent = total ? Math.round((value / total) * 100) : 0;
            return `${label}: ${percent}%`;
          }
        }
      }
    }
  };

  // Función para navegar a la página de ventas
  const irAVentas = () => {
    navigate('/ventas');
  };

  // Plugin para sombra en el doughnut
  const shadowPlugin = {
    id: 'doughnutShadow',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = 'rgba(79,70,229,0.28)'; // Más opaco
      ctx.shadowBlur = 500; // Más blur
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0; // Más desplazamiento vertical
    },
    afterDraw: (chart) => {
      chart.ctx.restore();
    }
  };

  return (
    <div className={`grafico-metodo-card ${className} ${showBuscadorPorFechas ? 'with-buscador-card' : ''}`}>
      {/* When showBuscadorPorFechas is true we add a modifier class so the header stacks title + buscador */}
      <div className={`grafico-metodo-header ${showBuscadorPorFechas ? 'with-buscador' : ''}`}>
        <div className="grafico-metodo-header-content">
          <div className="grafico-metodo-title-with-icon">
            <span className="grafico-metodo-icon" role="img" aria-label="Metodos de pago">💳</span>
            <h2 className="grafico-metodo-title">Ventas realizadas</h2>
          </div>
          <p className="grafico-metodo-subtitle">{new Date().toLocaleDateString()}</p>
        </div>
        {showBuscadorPorFechas ? (
          // place buscador on its own line below the title (full width)
          <div className="grafico-metodo-buscador-fullwidth">
            <BuscadorPorFechas
              desde={desde}
              hasta={hasta}
              onChangeDesde={setDesde}
              onChangeHasta={setHasta}
              mostrarDescarga={false}
              onBuscar={() => {}}
            />
          </div>
        ) : (
          <button 
            className="grafico-metodo-action" 
            title="Ver todos"
            onClick={irAVentas}
          >
            Ver todos <span className="arrow">→</span>
          </button>
        )}
      </div>
      <div className="grafico-metodo-body">
        <div className="grafico-metodo-chart-container">
          <Doughnut data={data} options={options} height={chartHeight} width={chartWidth} plugins={[shadowPlugin]} />
        </div>
        <div className="grafico-metodo-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: COLORS[0] }}></span> TC
            <span className="legend-percent">{safePercent(counts.TC)}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: COLORS[1] }}></span> TB
            <span className="legend-percent">{safePercent(counts.TB)}%</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: COLORS[2] }}></span> FT
            <span className="legend-percent">{safePercent(counts.FT)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetodoDePago;
