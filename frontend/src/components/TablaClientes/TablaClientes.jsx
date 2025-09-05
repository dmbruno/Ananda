import React, { useEffect, useState } from "react";
import ModalMensajeWhatsApp from "../Modals/ModalMensajeWhatsApp";
import ModalNuevoCliente from "../Modals/ModalNuevoCliente";
import { useSelector, useDispatch } from "react-redux";
import { fetchClientes } from "../../store/clientesSlice";
import { marcarClienteSaludado, eliminarClienteApi } from "../../api/clientes";
import notify from '../../utils/notify';
import "./TablaClientes.css";
import Buscador from '../Buscador/Buscador';
import BotonCustom from "../Botones/BotonCustom";
import { FaCheckCircle } from "react-icons/fa";
import {
  calcularProximoCumple,
  diasHastaCumple,
  estadoCumple,
  formatearFecha,
  formatearFechaCompleta,
} from "../../utils/dateUtils";
import { useConfirm } from '../../utils/confirm/ConfirmContext';

const TablaClientes = (props) => {
  const dispatch = useDispatch();
  const {
    items: clientes,
    status,
    error,
  } = useSelector((state) => state.clientes);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [modalWhatsAppOpen, setModalWhatsAppOpen] = useState(false);
  const [modalVerClienteOpen, setModalVerClienteOpen] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [clientesSaludados, setClientesSaludados] = useState({});
  const [ordenarPorCumple, setOrdenarPorCumple] = useState(false);

  const confirm = useConfirm();

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchClientes());
    }
  }, [dispatch, status]);

  // Permite refrescar la lista desde el padre (por ejemplo, tras guardar o editar)
  useEffect(() => {
    dispatch(fetchClientes());
  }, [props.refrescarClientes, dispatch]);

  // Cargar clientes saludados desde los datos de la API
  useEffect(() => {
    if (clientes && clientes.length > 0) {
      // Crear un objeto con los clientes saludados a partir de los datos de la API
      const saludadosObj = {};
      clientes.forEach(cliente => {
        if (cliente.ultimo_saludo) {
          saludadosObj[cliente.id] = cliente.ultimo_saludo;
        }
      });
      
      setClientesSaludados(saludadosObj);
      console.log("Estado de clientes saludados cargado desde la API");
    }
  }, [clientes]);

  const handleEditarCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    props.onEditarCliente(cliente);
  };

  const handleEliminarCliente = async (clienteId) => {
    try {
      const ok = await confirm('¿Seguro desea eliminar este cliente?');
      if (!ok) {
        notify.info('Eliminación cancelada');
        return;
      }
      await eliminarClienteApi(clienteId);
      notify.success('Cliente eliminado correctamente.');
      dispatch(fetchClientes());
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
      notify.error(`Error al eliminar el cliente: ${err?.message || err}`, { autoClose: 5000 });
    }
  };

  const handleAbrirWhatsApp = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalWhatsAppOpen(true);
  };

  const handleCerrarWhatsApp = () => {
    setModalWhatsAppOpen(false);
    setClienteSeleccionado(null);
  };

  const handleVerCliente = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalVerClienteOpen(true);
  };

  const handleCerrarModalVerCliente = () => {
    setModalVerClienteOpen(false);
    setClienteSeleccionado(null);
  };

  // Función para marcar cliente como saludado por cumpleaños
  const marcarComoSaludado = async (clienteId, event) => {
    // Si viene de un evento (click del botón), evitar propagación
    if (event) {
      event.stopPropagation(); // Evitar que se abra el modal del cliente
    }

    try {
      // Llamar a la API para marcar el cliente como saludado
      const respuesta = await marcarClienteSaludado(clienteId);
      
      // Actualizar el estado local con la fecha devuelta por la API
      setClientesSaludados(prev => ({
        ...prev,
        [clienteId]: respuesta.fecha
      }));
      
      console.log(`Cliente ${clienteId} marcado como saludado en la fecha ${respuesta.fecha}`);
      
      // Refrescar la lista de clientes para asegurarse de que tenemos los datos actualizados
      dispatch(fetchClientes());
    } catch (error) {
      console.error(`Error al marcar cliente ${clienteId} como saludado:`, error);
      notify.error('Ha ocurrido un error al marcar el cliente como saludado. Por favor intenta nuevamente.', { autoClose: 5000 });
    }
  };

  // Función para alternar entre ordenar por ID o por proximidad de cumpleaños
  const toggleOrdenarPorCumple = () => {
    setOrdenarPorCumple(!ordenarPorCumple);
  };

  // Filtrado de clientes según la búsqueda
  const clientesFiltrados = clientes.filter((cliente) => {
    if (!busqueda.trim()) return true;
    const texto = busqueda.toLowerCase();
    return (
      String(cliente.id).toLowerCase().includes(texto) ||
      (cliente.nombre && cliente.nombre.toLowerCase().includes(texto)) ||
      (cliente.apellido && cliente.apellido.toLowerCase().includes(texto)) ||
      (cliente.telefono && cliente.telefono.toLowerCase().includes(texto)) ||
      (cliente.fecha_nacimiento &&
        cliente.fecha_nacimiento.toLowerCase().includes(texto))
    );
  });

  // Ordenar clientes por proximidad de cumpleaños o por ID
  const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
    if (ordenarPorCumple) {
      // Ordenar por proximidad de cumpleaños
      const diasA = diasHastaCumple(a.fecha_nacimiento);
      const diasB = diasHastaCumple(b.fecha_nacimiento);

      // Si alguno no tiene fecha de cumpleaños, ponerlo al final
      if (diasA === null) return 1;
      if (diasB === null) return -1;

      return diasA - diasB;
    } else {
      // Ordenar por ID (comportamiento por defecto)
      return a.id - b.id;
    }
  });

  const formatearFechaCumple = (fecha) => {
    if (!fecha) return "Sin fecha";
    // Usar nuestra función mejorada que ignora la hora
    return formatearFecha(fecha);
  };

  const formatearEstadoCumple = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";

    try {
      const dias = diasHastaCumple(fechaNacimiento);
      
      // Si no pudimos calcular los días
      if (dias === null) return "";
      
      if (dias === 0) return "¡Hoy!";
      if (dias === 1) return "¡Mañana!";
      return `En ${dias} días`;
    } catch (error) {
      console.error("Error al calcular estado de cumpleaños:", error);
      return "Error";
    }
  };

  return (
    <div className="tabla-clientes-container">
      <div className="tabla-clientes-buscador-bar">
        <div className="tabla-clientes-title-group">
          <h2 className="dashboard-title">Clientes</h2>
        </div>
        <div className="tabla-clientes-filtros">
          <label className="toggle-cumple">
            <input
              type="checkbox"
              checked={ordenarPorCumple}
              onChange={toggleOrdenarPorCumple}
            />
            {ordenarPorCumple ? "Ordenado por cumpleaños" : "Ordenado por ID"}
          </label>
        </div>
        <div className="tabla-clientes-buscador">
          <Buscador
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente..."
          />
          <BotonCustom
            variant="success"
            size="medium"
            className="boton-custom--success boton-custom--medium boton-clientes-page"
            icon={
              <svg
                width="16"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            }
            onClick={props.onAgregarCliente}
          >
            Cliente
          </BotonCustom>
        </div>
      </div>
      <div className="tabla-clientes-table-wrapper">
        {status === "loading" && (
          <div className="tabla-clientes-loading">Cargando clientes...</div>
        )}
        {status === "failed" && (
          <div className="tabla-clientes-error">Error: {error}</div>
        )}
        {status === "succeeded" && (
          <div className="tabla-clientes-table-container">
            <div className="leyenda-cumpleanios">
              <div className="leyenda-item leyenda-hoy-no-saludado">
                Cumple Cercano
              </div>
              <div className="leyenda-item leyenda-proximo-no-saludado">
                Próximos 5 días
              </div>
              <div className="leyenda-item leyenda-lejano">Más de 5 días</div>
              <div className="leyenda-item">
                Sin fecha: <span className="cumple-sin-fecha">Sin fecha</span>
              </div>
              <div className="leyenda-item">
                <FaCheckCircle size={14} color="#1a56db" style={{marginRight: '5px'}} />
                Cliente saludado
              </div>
            </div>

            <div className="tabla-clientes-scroll-container">
              <table className="tabla-clientes">
                <thead>
                  <tr className="tabla-clientes-header-row">
                    <th className="tabla-clientes-th">ID</th>
                    <th className="tabla-clientes-th">Nombre</th>
                    <th className="tabla-clientes-th">Apellido</th>
                    <th className="tabla-clientes-th">Telefono</th>
                    <th className="tabla-clientes-th">Cumpleaños</th>
                    <th className="tabla-clientes-th">Estado</th>
                    <th className="tabla-clientes-th">WhatsApp</th>
                    <th className="tabla-clientes-th">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesOrdenados.map((c, idx) => (
                    <tr
                      key={c.id}
                      className={`tabla-clientes-row${
                        idx % 2 === 1 ? " tabla-clientes-row-alt" : ""
                      }`}
                    >
                      <td
                        className="tabla-clientes-td tabla-clientes-id"
                        onClick={() => handleVerCliente(c)}
                        style={{ cursor: "pointer" }}
                      >
                        {String(c.id).padStart(3, "0")}
                      </td>
                      <td
                        className="tabla-clientes-td tabla-clientes-nombre"
                        onClick={() => handleVerCliente(c)}
                        style={{ cursor: "pointer" }}
                      >
                        {c.nombre}
                      </td>
                      <td
                        className="tabla-clientes-td tabla-clientes-apellido"
                        onClick={() => handleVerCliente(c)}
                        style={{ cursor: "pointer" }}
                      >
                        {c.apellido}
                      </td>
                      <td
                        className="tabla-clientes-td tabla-clientes-telefono"
                        onClick={() => handleVerCliente(c)}
                        style={{ cursor: "pointer" }}
                      >
                        {c.telefono}
                      </td>
                      <td
                        className="tabla-clientes-td tabla-clientes-cumple"
                        onClick={() => handleVerCliente(c)}
                        style={{ cursor: "pointer" }}
                      >
                        <span
                          className={`cumple-${estadoCumple(
                            c.fecha_nacimiento,
                            !!clientesSaludados[c.id]
                          )}`}
                        >
                          {formatearFechaCumple(c.fecha_nacimiento)}
                        </span>
                      </td>
                      <td
                        className="tabla-clientes-td tabla-clientes-estado-cumple"
                        onClick={() => handleVerCliente(c)}
                        style={{ cursor: "pointer", position: "relative" }}
                      >
                        <div className="cumple-status-container">
                          <span
                            className={`cumple-${estadoCumple(
                              c.fecha_nacimiento,
                              !!clientesSaludados[c.id]
                            )}`}
                          >
                            {formatearEstadoCumple(c.fecha_nacimiento)}
                          </span>
                          {clientesSaludados[c.id] && (
                            <span className="cliente-saludado-icon" title="Cliente ya saludado">
                              <FaCheckCircle size={16} color="#1a56db" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="tabla-clientes-td tabla-clientes-wa">
                        <button
                          className="tabla-clientes-wa-link"
                          title="Enviar WhatsApp"
                          type="button"
                          onClick={() => handleAbrirWhatsApp(c)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                          }}
                        >
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="16" cy="16" r="16" fill="none" />
                            <path
                              d="M16 6C10.477 6 6 10.477 6 16c0 1.624.43 3.143 1.18 4.46L6 26l5.66-1.16A9.956 9.956 0 0016 26c5.523 0 10-4.477 10-10S21.523 6 16 6zm0 18c-1.47 0-2.84-.4-4.01-1.09l-.29-.17-3.36.69.69-3.27-.18-.3A7.96 7.96 0 018 16c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8zm4.13-5.47c-.22-.11-1.3-.64-1.5-.71-.2-.07-.35-.11-.5.11-.15.22-.57.71-.7.86-.13.15-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.66-.59-1.1-1.32-1.23-1.54-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.07-.11-.5-1.21-.68-1.66-.18-.44-.36-.38-.5-.39-.13-.01-.28-.01-.43-.01-.15 0-.39.06-.6.28-.21.22-.8.78-.8 1.9 0 1.12.82 2.2.93 2.35.11.15 1.62 2.48 3.93 3.38.55.19.98.3 1.31.38.55.14 1.05.12 1.44.07.44-.07 1.3-.53 1.48-1.04.18-.51.18-.95.13-1.04-.05-.09-.2-.15-.42-.26z"
                              fill="#25D366"
                            />
                          </svg>
                        </button>
                      </td>
                      <td className="tabla-clientes-td tabla-clientes-acciones">
                        <button
                          className="tabla-clientes-btn tabla-clientes-btn-edit"
                          title="Editar cliente"
                          onClick={() => handleEditarCliente(c)}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#888A3C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
                          </svg>
                        </button>
                        <button
                          className="tabla-clientes-btn tabla-clientes-btn-delete"
                          title="Eliminar cliente"
                          onClick={() => handleEliminarCliente(c.id)}
                        >
                          <svg
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#222"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Footer sticky con conteo de clientes */}
            <div className="tabla-clientes-summary">
              <span className="registros-info">
                {busqueda.trim() ? (
                  <>
                    Mostrando <strong>{clientesOrdenados.length}</strong> de <strong>{clientes.length}</strong> clientes
                  </>
                ) : (
                  <>
                    Existen <strong>{clientes.length}</strong> clientes guardados
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
      {modalWhatsAppOpen && (
        <ModalMensajeWhatsApp
          open={modalWhatsAppOpen}
          onClose={handleCerrarWhatsApp}
          cliente={clienteSeleccionado}
          onClienteSaludado={marcarComoSaludado}
        />
      )}

      {modalVerClienteOpen && clienteSeleccionado && (
        <ModalNuevoCliente
          open={modalVerClienteOpen}
          onClose={handleCerrarModalVerCliente}
          cliente={clienteSeleccionado}
          soloLectura={true}
        />
      )}
    </div>
  );
};

export default TablaClientes;
