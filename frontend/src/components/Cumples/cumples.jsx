import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchClientes, marcarClienteSaludado } from "../../store/clientesSlice";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import "./cumples.css";
import ModalMensajeWhatsApp from "../Modals/ModalMensajeWhatsApp";

dayjs.extend(customParseFormat);

// Función para verificar si el cliente ya fue saludado este año
const yaFueSaludadoEsteAno = (fechaNacimiento, ultimoSaludo) => {
  if (!ultimoSaludo) return false;
  
  const hoy = new Date();
  const anoActual = hoy.getFullYear();
  
  // Obtener la fecha de cumpleaños de este año
  const [anoNac, mesNac, diaNac] = fechaNacimiento.split('-').map(Number);
  const cumpleEsteAno = new Date(anoActual, mesNac - 1, diaNac);
  
  // Si el cumpleaños ya pasó este año, comparar con este año
  // Si no ha llegado, comparar con el año pasado
  let anoComparacion = anoActual;
  if (cumpleEsteAno > hoy) {
    anoComparacion = anoActual - 1;
  }
  
  const fechaUltimoSaludo = new Date(ultimoSaludo);
  return fechaUltimoSaludo.getFullYear() >= anoComparacion;
};

// Utilidad para calcular el día del año considerando bisiesto
function getDayOfYear(dia, mes, anio) {
  const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Si es bisiesto y después de febrero, sumar 1 día
  const esBisiesto = (anio) => (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0));
  let dayOfYear = 0;
  for (let i = 0; i < mes - 1; i++) {
    dayOfYear += diasPorMes[i];
    if (i === 1 && esBisiesto(anio)) dayOfYear += 1; // Sumar día extra de febrero si bisiesto
  }
  dayOfYear += dia;
  return dayOfYear;
}

// Utilidad para calcular días hasta el próximo cumpleaños sin objetos Date ni dayjs
function diasHastaCumple(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const diaHoy = hoy.getDate();
  const mesHoy = hoy.getMonth() + 1;
  const anioHoy = hoy.getFullYear();
  const [anio, mes, dia] = fechaNacimiento.split('-').map(Number);

  const dayOfYearHoy = getDayOfYear(diaHoy, mesHoy, anioHoy);
  const dayOfYearCumple = getDayOfYear(dia, mes, anioHoy);
  const esBisiesto = (anio) => (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0));
  const diasEnAnio = esBisiesto(anioHoy) ? 366 : 365;

  if (dayOfYearCumple === dayOfYearHoy) return 0;
  if (dayOfYearCumple > dayOfYearHoy) {
    return dayOfYearCumple - dayOfYearHoy;
  } else {
    return diasEnAnio - dayOfYearHoy + dayOfYearCumple;
  }
}

function getIniciales(nombre, apellido) {
  return `${nombre?.[0] || ""}${apellido?.[0] || ""}`.toUpperCase();
}

const Cumples = ({ fechaInicio, fechaFin }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: clientes, status } = useSelector((state) => state.clientes);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  useEffect(() => {
    if (status === "idle") dispatch(fetchClientes());
  }, [dispatch, status]);

  // Filtrar clientes que NO han sido saludados este año y ordenar por días hasta el cumple
  const clientesConCumple = clientes
    .filter((c) => c.fecha_nacimiento && !yaFueSaludadoEsteAno(c.fecha_nacimiento, c.ultimo_saludo))
    .map((c) => ({
      ...c,
      dias: diasHastaCumple(c.fecha_nacimiento),
    }))
    .filter((c) => {
      // Si hay filtro de fechas, solo incluir los que cumplen dentro del rango
      if (fechaInicio && fechaFin) {
        const hoy = new Date();
        const cumple = new Date(c.fecha_nacimiento);
        cumple.setFullYear(hoy.getFullYear());
        if (
          cumple.getMonth() < hoy.getMonth() ||
          (cumple.getMonth() === hoy.getMonth() && cumple.getDate() < hoy.getDate())
        ) {
          cumple.setFullYear(hoy.getFullYear() + 1);
        }
        return cumple >= new Date(fechaInicio) && cumple <= new Date(fechaFin);
      }
      return true;
    })
    .sort((a, b) => a.dias - b.dias)
    .slice(0, 10);

  // Función para manejar el envío de mensaje
  const handleEnviarMensaje = async (clienteId) => {
    try {
      console.log(`Marcando cliente con ID ${clienteId} como saludado desde Cumples.jsx`);
      await dispatch(marcarClienteSaludado(clienteId)).unwrap();
      console.log(`Cliente ${clienteId} marcado como saludado exitosamente`);
      
      // Actualizar la lista de clientes para que el cliente saludado desaparezca
      dispatch(fetchClientes());
      
      // Cerrar el modal
      setModalOpen(false);
      setClienteSeleccionado(null);
    } catch (error) {
      console.error('Error al marcar cliente como saludado:', error);
      alert('Error al marcar cliente como saludado. Intente nuevamente.');
    }
  };

  const irAClientes = () => {
    navigate('/clientes');
  };

  return (
    <div className="cumples-card">
      <div className="cumples-header">
        <span className="cumples-icon" role="img" aria-label="Torta">🎉</span>
        <h2 className="cumples-title">Proximos cumpleaños</h2>
        <button className="cumples-action" onClick={irAClientes} title="Ver todos">
          Ver todos <span className="arrow">→</span>
        </button>
      </div>

      {clientesConCumple.length === 0 ? (
        <div className="cumples-no-results">
          <div className="cumples-no-results-content">
            
            <p className="cumples-no-results-text">No hay clientes para saludar</p>
            <button 
              className="cumples-ver-todos-btn"
              onClick={irAClientes}
            >
              Para ver todos presiona aquí
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="cumples-list-header">
            <span></span>
            <span></span>
            <span className="cumples-fecha-label-header">Cumple</span>
            <span></span>
          </div>
          <div className="cumples-list">
            {clientesConCumple.map((c) => (
              <div className="cumples-item" key={c.id}>
                <div className="cumples-avatar">{getIniciales(c.nombre, c.apellido)}</div>
                <div className="cumples-info">
                  <span className="cumples-nombre">{c.nombre} {c.apellido}</span>
                  <span className="cumples-desc-inline">
                    {c.dias === 0 ? "Es Hoy!" : `Faltan ${c.dias} días`}
                  </span>
                </div>
                <div className="cumples-fecha">
                  {(() => {
                    const [anio, mes, dia] = c.fecha_nacimiento.split('-').map(Number);
                    return `${dia}/${mes}`;
                  })()}
                </div>
                <div className="cumples-wa">
                  <button
                    className="cumples-wa-btn"
                    title="Enviar WhatsApp"
                    onClick={() => {
                      setClienteSeleccionado(c);
                      setModalOpen(true);
                    }}
                    style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="16" fill="none"/>
                      <path d="M16 6C10.477 6 6 10.477 6 16c0 1.624.43 3.143 1.18 4.46L6 26l5.66-1.16A9.956 9.956 0 0016 26c5.523 0 10-4.477 10-10S21.523 6 16 6zm0 18c-1.47 0-2.84-.4-4.01-1.09l-.29-.17-3.36.69.69-3.27-.18-.3A7.96 7.96 0 018 16c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8zm4.13-5.47c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.15-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.66-.59-1.1-1.32-1.23-1.54-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.5-1.21-.68-1.66-.18-.44-.36-.38-.5-.39-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.28-.21.22-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.62 2.48 3.93 3.38.55.19.98.3 1.31.38.55.14 1.05.12 1.44.07.44-.07 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.42-.26z" fill="#25D366"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      
      <ModalMensajeWhatsApp
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        cliente={clienteSeleccionado}
        onEnviarMensaje={handleEnviarMensaje}
      />
    </div>
  );
};

export default Cumples;
