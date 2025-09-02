import React, { useRef, useState, useEffect } from "react";
import "./ModalNuevoUsuario.css";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonEnviar from "../Botones/BotonEnviar";
import BotonEditar from "../Botones/BotonEditar";
import { MdPersonAdd, MdPerson } from "react-icons/md";
import { useDispatch } from "react-redux";
import { fetchUsuarios } from "../../store/usuariosSlice";
import axios from "axios";

const camposIniciales = {
  nombre: "",
  apellido: "",
  email: "",
  password: "",
  is_admin: false,
  activo: true,
};

const ModalNuevoUsuario = ({ open, onClose, onSubmit, usuario, soloLectura = false, onUsuarioGuardado }) => {
  const [campos, setCampos] = useState(usuario || camposIniciales);
  const [exiting, setExiting] = useState(false);
  const [modoSoloLectura, setModoSoloLectura] = useState(soloLectura);
  const timeoutRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) {
      setExiting(false);
      setCampos(usuario || camposIniciales); // Resetea o carga datos al abrir
      setModoSoloLectura(soloLectura); // Resetea el modo al abrir
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open, usuario, soloLectura]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCampos((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
    
    // Si es solo lectura, solo cerrar el modal
    if (modoSoloLectura) {
      handleClose();
      return;
    }
    
    try {
      if (campos.id) {
        // Edición: PUT
        await axios.put(`/api/usuarios/${campos.id}`, campos);
        alert("Usuario actualizado correctamente.");
      } else {
        // Alta: POST
        await axios.post("/api/usuarios/", campos);
        alert("Usuario guardado correctamente.");
      }
      // Refresca la lista de usuarios inmediatamente
      dispatch(fetchUsuarios());
      if (typeof onUsuarioGuardado === 'function') {
        onUsuarioGuardado();
      } else {
        handleClose();
      }
    } catch (error) {
      alert("Error al guardar el usuario.");
      console.error("Error:", error);
    }
  };

  const handleEditarClick = () => {
    setModoSoloLectura(false);
  };

  if (!open && !exiting) return null;

  // Permite cerrar el modal haciendo click fuera del contenedor
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-usuario-backdrop")) {
      handleClose();
    }
  };

  // Evita que el click dentro del modal propague al backdrop
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="modal-usuario-backdrop" onClick={handleBackdropClick}>
      <div
        className={`modal-usuario-container${exiting ? " modal-usuario-exit" : ""}`}
        onClick={stopPropagation}
      >
        <form
          onSubmit={handleSubmit}
          className="modal-usuario-form"
          autoComplete="off"
        >
          <div className="modal-usuario-form-group">
            <h2 className="modal-usuario-title">
              {modoSoloLectura ? "Detalles del usuario" : 
               campos.id ? "Editar usuario" : "Alta de usuario nuevo"}
            </h2>
            {modoSoloLectura ? (
              <MdPerson
                size={40}
                color="#222"
                style={{ display: "block", margin: "0 auto 0.5rem auto" }}
              />
            ) : campos.id ? (
              <MdPerson
                size={40}
                color="#222"
                style={{ display: "block", margin: "0 auto 0.5rem auto" }}
              />
            ) : (
              <MdPersonAdd
                size={40}
                color="#222"
                style={{ display: "block", margin: "0 auto 0.5rem auto" }}
              />
            )}
            <label className="modal-usuario-label">
              Nombre
              <input
                className="modal-usuario-input"
                name="nombre"
                value={campos.nombre}
                onChange={handleChange}
                autoFocus={!modoSoloLectura}
                readOnly={modoSoloLectura}
                required
              />
            </label>
            <label className="modal-usuario-label">
              Apellido
              <input
                className="modal-usuario-input"
                name="apellido"
                value={campos.apellido}
                onChange={handleChange}
                readOnly={modoSoloLectura}
                required
              />
            </label>
            <label className="modal-usuario-label">
              Correo Electrónico
              <input
                className="modal-usuario-input"
                name="email"
                type="email"
                value={campos.email}
                onChange={handleChange}
                readOnly={modoSoloLectura}
                required
              />
            </label>
            
            {/* Campo contraseña - siempre visible pero con diferentes comportamientos */}
            <label className="modal-usuario-label">
              Contraseña
              {modoSoloLectura ? (
                <input
                  className="modal-usuario-input password-readonly"
                  type="text"
                  value="••••••••"
                  readOnly
                />
              ) : (
                <input
                  className="modal-usuario-input"
                  name="password"
                  type="password"
                  value={campos.password}
                  onChange={handleChange}
                  placeholder={campos.id ? "Dejar vacío para mantener contraseña actual" : ""}
                  required={!campos.id} // Obligatorio solo para nuevos usuarios
                  minLength="6"
                />
              )}
            </label>
            
            {/* Campo Admin - siempre visible pero con diferentes comportamientos */}
            <label className="modal-usuario-label checkbox-label">
              <input
                type="checkbox"
                name="is_admin"
                checked={campos.is_admin}
                onChange={modoSoloLectura ? undefined : handleChange}
                readOnly={modoSoloLectura}
                className={modoSoloLectura ? "modal-usuario-checkbox-readonly" : "modal-usuario-checkbox"}
              />
              Admin
            </label>
          </div>
          <div className="modal-usuario-footer">
            <BotonCancelar type="button" onClick={(e) => {
              e.preventDefault();
              handleClose();
            }}>
              Atrás
            </BotonCancelar>
            {modoSoloLectura ? (
              <BotonEditar type="button" onClick={handleEditarClick}>
                Editar
              </BotonEditar>
            ) : (
              <BotonEnviar type="submit">Guardar</BotonEnviar>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevoUsuario;
