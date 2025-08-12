import React, { useRef, useState, useEffect } from "react";
import "./ModalNuevoCliente.css";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonEnviar from "../Botones/BotonEnviar";
import { MdPersonAdd, MdPerson } from "react-icons/md";
import { useDispatch } from "react-redux";
import { fetchClientes } from "../../store/clientesSlice";
import axios from "axios";

const camposIniciales = {
  nombre: "",
  apellido: "",
  telefono: "",
  fecha_nacimiento: "",
  activo: true,
};

const ModalNuevoCliente = ({ open, onClose, onSubmit, cliente }) => {
  const [campos, setCampos] = useState(cliente || camposIniciales);
  const [exiting, setExiting] = useState(false);
  const timeoutRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) {
      setExiting(false);
      setCampos(cliente || camposIniciales); // Resetea o carga datos al abrir
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open, cliente]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampos((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (exiting) return; // Evita múltiples intentos de cierre
    setExiting(true);
    timeoutRef.current = setTimeout(() => {
      onClose();
      setExiting(false); // Reinicia el estado después de cerrar
    }, 350); // Espera la animación inversa antes de cerrar
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (campos.id) {
        // Edición: PUT
        await axios.put(`/api/clientes/${campos.id}`, campos);
        alert("Cliente actualizado correctamente.");
      } else {
        // Alta: POST
        await axios.post("/api/clientes/", campos);
        alert("Cliente guardado correctamente.");
      }
      // Refresca la lista de clientes inmediatamente
      dispatch(fetchClientes());
      if (typeof onClienteGuardado === 'function') {
        onClienteGuardado();
      } else {
        handleClose();
      }
    } catch {
      alert("Error al guardar el cliente.");
    }
  };

  if (!open && !exiting) return null;

  // Permite cerrar el modal haciendo click fuera del contenedor
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-cliente-backdrop")) {
      handleClose();
    }
  };

  // Evita que el click dentro del modal propague al backdrop
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-cliente-backdrop" onClick={handleBackdropClick}>
      <div
        className={`modal-cliente-container${exiting ? " modal-cliente-exit" : ""}`}
        onClick={stopPropagation}
      >
        <form
          onSubmit={handleSubmit}
          className="modal-cliente-form"
          autoComplete="off"
        >
          <div className="modal-cliente-form-group">
            {campos.id ? (
              <MdPerson
                size={48}
                color="#222"
                style={{ display: "block", margin: "0 auto 0.75rem auto" }}
              />
            ) : (
              <MdPersonAdd
                size={48}
                color="#222"
                style={{ display: "block", margin: "0 auto 0.75rem auto" }}
              />
            )}
            <label className="modal-cliente-label">
              Nombre
              <input
                className="modal-cliente-input"
                name="nombre"
                value={campos.nombre}
                onChange={handleChange}
                autoFocus
              />
            </label>
            <label className="modal-cliente-label">
              Apellido
              <input
                className="modal-cliente-input"
                name="apellido"
                value={campos.apellido}
                onChange={handleChange}
              />
            </label>
            <label className="modal-cliente-label">
              Telefono
              <input
                className="modal-cliente-input"
                name="telefono"
                value={campos.telefono}
                onChange={handleChange}
              />
            </label>
            <label className="modal-cliente-label particular">
              Fecha de nacimiento
              <input
                className="modal-cliente-input fecha-cliente-input"
                name="fecha_nacimiento"
                type="date"
                value={campos.fecha_nacimiento}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="modal-cliente-footer">
            <BotonCancelar type="button" onClick={(e) => {
              e.preventDefault();
              handleClose();
            }}>
              Atras
            </BotonCancelar>
            <BotonEnviar type="submit">Guardar</BotonEnviar>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoCliente;
