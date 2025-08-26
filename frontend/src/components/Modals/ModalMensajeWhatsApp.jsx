import React, { useRef, useState, useEffect } from "react";
import "./ModalMensajeWhatsApp.css";
import BotonCancelar from "../Botones/BotonCancelar";
import BotonEnviar from "../Botones/BotonEnviar";
import { diasHastaCumple } from "../../utils/dateUtils";

const mensajeCumpleanios = (nombre) =>
  `🎂 ¡Feliz Cumpleaños ${nombre || "[Nombre]"}! 

De parte de todo el equipo de ANANDA queremos desearte un día maravilloso. 

¡Que todos tus deseos se cumplan!
❤️`;

const mensajePromocional = (nombre) =>
  `👋 Escribe aquí tu mensaje promocional o informativo para ${nombre || "el cliente"}.

Saludos,
Equipo ANANDA 💖`;

const ModalMensajeWhatsApp = ({ open, onClose, cliente, onClienteSaludado, onEnviarMensaje }) => {
  const [exiting, setExiting] = useState(false);
  const timeoutRef = useRef();
  // Estado para verificar si el cliente ya fue saludado
  const [clienteSaludado, setClienteSaludado] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (open && cliente) {
      setExiting(false);
      
      // Verificar si el cliente ya fue saludado usando ultimo_saludo de la base de datos
      const yaFueSaludado = !!cliente.ultimo_saludo;
      setClienteSaludado(yaFueSaludado);
      
      // Simplificamos la lógica: si ya está saludado → mensaje promocional, si no → mensaje de cumpleaños
      if (yaFueSaludado) {
        // Cliente ya saludado - mostrar mensaje promocional
        setMensaje(mensajePromocional(cliente?.nombre));
        console.log(`Cliente ${cliente.id} - Ya saludado: mostrando mensaje PROMOCIONAL`);
      } else {
        // Cliente no saludado - mostrar mensaje de cumpleaños
        setMensaje(mensajeCumpleanios(cliente?.nombre));
        console.log(`Cliente ${cliente.id} - No saludado: mostrando mensaje de CUMPLEAÑOS`);
      }
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
  
  const handleEnviarMensaje = () => {
    if (!cliente || !cliente.telefono) {
      alert("No se puede enviar el mensaje: el cliente no tiene número de teléfono.");
      return;
    }
    
    // Eliminar cualquier caracter que no sea número del teléfono
    const numeroLimpio = cliente.telefono.replace(/\D/g, "");
    
    // Verificar si el número tiene el formato correcto
    if (numeroLimpio.length < 8) {
      alert("El número de teléfono no parece válido.");
      return;
    }
    
    // Formatear el número para WhatsApp (agregar código de país si es necesario)
    let numeroCompleto = numeroLimpio;
    if (!numeroCompleto.startsWith("54")) {
      numeroCompleto = "54" + numeroCompleto;
    }
    
    // Codificar el mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Crear la URL de WhatsApp
    const whatsappUrl = `https://wa.me/${numeroCompleto}?text=${mensajeCodificado}`;
    
    // Marcar al cliente como saludado siempre que se envía un mensaje
    // Usamos onEnviarMensaje si está disponible, sino onClienteSaludado (compatibilidad)
    const callbackSaludar = onEnviarMensaje || onClienteSaludado;
    if (typeof callbackSaludar === 'function') {
      console.log(`Marcando cliente ${cliente.id} como saludado después de enviar WhatsApp`);
      callbackSaludar(cliente);
    }
    
    // Abrir WhatsApp Web en una nueva pestaña
    window.open(whatsappUrl, '_blank');
    
    // Cerrar el modal
    handleClose();
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
        <div className="modal-whatsapp-subtitle">
          {mensaje.includes("Feliz Cumpleaños") ? "Mensaje de cumpleaños..." : "Mensaje promocional..."}
        </div>
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
          <BotonEnviar onClick={() => handleEnviarMensaje()} />
        </div>
      </div>
    </div>
  );
};

export default ModalMensajeWhatsApp;
