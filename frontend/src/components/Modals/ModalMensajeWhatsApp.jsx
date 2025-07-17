import React, { useRef, useState, useEffect } from "react";
import "./ModalMensajeWhatsApp.css";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonEnviar from "../Botones/BotonEnviar";

const mensajeDefault = (nombre) =>
  `¡Hola ${nombre || "[Nombre]"}! 🎉\nHoy es tu día y queremos celebrarlo con vos 💐\nPasá por ANANDA durante esta semana\ny recibí un 10% de descuento especial por tu cumpleaños 🛍️\n¡Te esperamos! 💖`;

const ModalMensajeWhatsApp = ({ open, onClose, cliente }) => {
  const [exiting, setExiting] = useState(false);
  const timeoutRef = useRef();
  const [mensaje, setMensaje] = useState(mensajeDefault(cliente?.nombre));

  useEffect(() => {
    if (open) {
      setExiting(false);
      setMensaje(mensajeDefault(cliente?.nombre));
    }
    return () => clearTimeout(timeoutRef.current);
  }, [open, cliente]);

  const handleClose = () => {
    setExiting(true);
    timeoutRef.current = setTimeout(() => {
      setExiting(false);
      onClose();
    }, 450); // Duración igual a la animación
  };

  if (!open && !exiting) return null;

  return (
    <div className="modal-whatsapp-backdrop" onClick={handleClose}>
      <div
        className={`modal-whatsapp-container${exiting ? " modal-exit" : ""}`}
        style={{ width: "18rem", height: "24rem" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-whatsapp-header">
          <span className="modal-whatsapp-icon" role="img" aria-label="celular">📲</span>
          <span className="modal-whatsapp-title">Enviar mensaje</span>
        </div>
        <div className="modal-whatsapp-subtitle">Personaliza tu mensaje…</div>
        <div className="modal-whatsapp-message-box">
          <textarea
            className="modal-whatsapp-message"
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={7}
          />
        </div>
        <div className="modal-whatsapp-actions">
          <BotonCancelar onClick={handleClose} />
          <BotonEnviar />
        </div>
      </div>
    </div>
  );
};

export default ModalMensajeWhatsApp;
