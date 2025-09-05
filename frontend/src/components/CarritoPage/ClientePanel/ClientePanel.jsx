import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCliente, setPaso } from '../../../store/ventaProcesoSlice';
import { fetchClientes } from '../../../store/clientesSlice';
import BuscadorCliente from './BuscadorCliente';
import ModalNuevoCliente from '../../Modals/ModalNuevoCliente';
import './ClientePanel.css';

const ClientePanel = () => {
  const dispatch = useDispatch();
  const { cliente, paso } = useSelector(state => state.ventaProceso);
  
  const [modalCrearCliente, setModalCrearCliente] = useState(false);
  const [modalEditarCliente, setModalEditarCliente] = useState(false);
  const [clienteInicial, setClienteInicial] = useState(null);

  const handleSeleccionarCliente = (clienteSeleccionado) => {
    dispatch(setCliente(clienteSeleccionado));
  };

  const handleCrearCliente = (nombre = '') => {
    // Crear un cliente inicial con el nombre si se proporciona
    const clienteNuevo = nombre ? { nombre, apellido: '', telefono: '', fecha_nacimiento: '' } : null;
    setClienteInicial(clienteNuevo);
    setModalCrearCliente(true);
  };

  const handleEditarCliente = () => {
    setClienteInicial(cliente);
    setModalEditarCliente(true);
  };

  const handleClienteGuardado = (clienteGuardado) => {
    // Cerrar modales y limpiar estado local
    setModalCrearCliente(false);
    setModalEditarCliente(false);
    setClienteInicial(null);

    // Si el modal nos devolvió el cliente creado/actualizado, seleccionarlo
    if (clienteGuardado && clienteGuardado.id) {
      dispatch(setCliente(clienteGuardado));
    } else {
      // En caso contrario, refrescar la lista global de clientes para que aparezca en los buscadores
      dispatch(fetchClientes());
    }
  };

  const handleCerrarModal = () => {
    setModalCrearCliente(false);
    setModalEditarCliente(false);
    setClienteInicial(null);
  };

  const handleCambiarCliente = () => {
    dispatch(setCliente(null));
  };

  const handleSiguientePaso = () => {
    if (cliente) {
      dispatch(setPaso(2));
    }
  };

  return (
    <div className="cliente-panel">
      <div className="cliente-panel-header">
        <h2 className="cliente-panel-title">👤 Cliente</h2>
        {paso === 1 && (
          <span className="cliente-panel-step-badge cliente-panel-step-current">Paso 1</span>
        )}
        {paso > 1 && cliente && (
          <span className="cliente-panel-step-badge cliente-panel-step-completed">✓ Completado</span>
        )}
      </div>

      <div className="cliente-panel-content">
        {/* Mostrar buscador cuando no hay cliente seleccionado */}
        {!cliente && (
          <BuscadorCliente 
            onClienteSeleccionado={handleSeleccionarCliente}
            onCrearCliente={handleCrearCliente}
          />
        )}

        {/* Mostrar información del cliente seleccionado */}
        {cliente && (
          <div className="cliente-panel-seleccionado">
            <div className="cliente-panel-info">
              <h3 className="cliente-panel-nombre">
                {cliente.nombre} {cliente.apellido || ''}
              </h3>
              <div className="cliente-panel-detalles">
                {cliente.telefono && (
                  <div className="cliente-panel-detalle">
                    <span className="cliente-panel-icono">📞</span>
                    <span>{cliente.telefono}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="cliente-panel-detalle">
                    <span className="cliente-panel-icono">📧</span>
                    <span>{cliente.email}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="cliente-panel-detalle">
                    <span className="cliente-panel-icono">📍</span>
                    <span>{cliente.direccion}</span>
                  </div>
                )}
                {cliente.fecha_nacimiento && (
                  <div className="cliente-panel-detalle">
                    <span className="cliente-panel-icono">🎂</span>
                    <span>{new Date(cliente.fecha_nacimiento).toLocaleDateString('es-AR')}</span>
                  </div>
                )}
                <div className="cliente-panel-detalle">
                  <span className="cliente-panel-icono">#</span>
                  <span>ID: {cliente.id}</span>
                </div>
              </div>
            </div>
            
            <div className="cliente-panel-acciones">
              <button 
                className="cliente-panel-btn-secundario"
                onClick={handleCambiarCliente}
              >
                Cambiar Cliente
              </button>
              <button 
                className="cliente-panel-btn-secundario"
                onClick={handleEditarCliente}
              >
                Editar Datos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer con botón para continuar al siguiente paso */}
      {cliente && paso === 1 && (
        <div className="cliente-panel-footer">
          <button 
            className="cliente-panel-btn-primario"
            onClick={handleSiguientePaso}
          >
            <span className="cliente-panel-siguiente-paso">
              Continuar al Carrito →
            </span>
          </button>
        </div>
      )}

      {/* Modales */}
      <ModalNuevoCliente
        open={modalCrearCliente}
        onClose={handleCerrarModal}
        cliente={clienteInicial}
        onClienteGuardado={handleClienteGuardado}
      />
      
      <ModalNuevoCliente
        open={modalEditarCliente}
        onClose={handleCerrarModal}
        cliente={clienteInicial}
        onClienteGuardado={handleClienteGuardado}
      />
    </div>
  );
};

export default ClientePanel;
