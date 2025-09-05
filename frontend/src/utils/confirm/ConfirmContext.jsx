import React, { createContext, useContext, useState, useCallback } from 'react';
import '../../utils/confirm/ConfirmContext.css';
import BotonCancelar from '../../components/Botones/BotonCancelar';
import BotonAgregar from '../../components/Botones/BotonAgregar';

const ConfirmContext = createContext(null);

export const ConfirmProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, message: '', resolve: null, options: {}, closing: false });

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, message: String(message), resolve, options, closing: false });
    });
  }, []);

  const handleClose = (result) => {
    const resolver = state.resolve;
    // trigger exit animation
    setState(prev => ({ ...prev, closing: true }));

    // wait for animation to finish before resolving and unmounting
    const ANIM_MS = 320;
    setTimeout(() => {
      if (resolver) resolver(result);
      setState({ open: false, message: '', resolve: null, options: {}, closing: false });
    }, ANIM_MS);
  };

  const modalClass = state.closing ? 'confirm-modal exit' : 'confirm-modal enter';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {state.open && (
        <div className="confirm-backdrop">
          <div className={modalClass} role="dialog" aria-modal="true">
            <div className="confirm-message">{state.message}</div>
            <div className="confirm-actions">
              <BotonCancelar onClick={() => handleClose(false)}>Cancelar</BotonCancelar>
              <BotonAgregar className="confirm-accept" onClick={() => handleClose(true)}>Aceptar</BotonAgregar>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return confirm;
};
