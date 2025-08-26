import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClientes } from '../../../store/clientesSlice';
import './BuscadorCliente.css';

export default function BuscadorCliente({ onClienteSeleccionado, onCrearCliente }) {
  const dispatch = useDispatch();
  const { items: clientes = [], status } = useSelector(state => state.clientes);
  const loading = status === 'loading';
  
  const [busqueda, setBusqueda] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  useEffect(() => {
    dispatch(fetchClientes());
  }, [dispatch]);

  useEffect(() => {
    if (busqueda.trim()) {
      const filtrados = clientes.filter(cliente => {
        const nombre = cliente.nombre?.toLowerCase() || '';
        const apellido = cliente.apellido?.toLowerCase() || '';
        const email = cliente.email?.toLowerCase() || '';
        const telefono = cliente.telefono || '';
        const busquedaLower = busqueda.toLowerCase();
        
        return nombre.includes(busquedaLower) ||
               apellido.includes(busquedaLower) ||
               email.includes(busquedaLower) ||
               telefono.includes(busqueda) ||
               `${nombre} ${apellido}`.includes(busquedaLower);
      });
      setClientesFiltrados(filtrados);
      setMostrarSugerencias(true);
    } else {
      setClientesFiltrados([]);
      setMostrarSugerencias(false);
    }
  }, [busqueda, clientes]);

  const handleSeleccionarCliente = (cliente) => {
    onClienteSeleccionado(cliente);
    setBusqueda('');
    setMostrarSugerencias(false);
  };

  const handleInputChange = (e) => {
    setBusqueda(e.target.value);
  };

  const handleFocus = () => {
    if (busqueda.trim()) {
      setMostrarSugerencias(true);
    }
  };

  const handleBlur = () => {
    // Delay para permitir el click en sugerencias
    setTimeout(() => {
      setMostrarSugerencias(false);
    }, 200);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && clientesFiltrados.length === 1) {
      e.preventDefault();
      handleSeleccionarCliente(clientesFiltrados[0]);
    }
  };

  return (
    <div className="buscador-cliente">
      <h3 className="buscador-cliente-titulo">Seleccionar Cliente</h3>
      
      <div className="buscador-cliente-input-container">
        <div className="buscador-cliente-input-wrapper">
          <i className="buscador-cliente-icono">🔍</i>
          <input
            type="text"
            className="buscador-cliente-input"
            placeholder="Buscar por nombre, email o teléfono..."
            value={busqueda}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          {busqueda && (
            <button
              className="buscador-cliente-limpiar"
              onClick={() => setBusqueda('')}
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {mostrarSugerencias && (
          <div className="buscador-cliente-sugerencias">
            {loading ? (
              <div className="buscador-cliente-cargando">
                <div className="buscador-cliente-spinner"></div>
                Cargando clientes...
              </div>
            ) : clientesFiltrados.length > 0 ? (
              <div className="buscador-cliente-lista">
                {clientesFiltrados.map(cliente => (
                  <div
                    key={cliente.id}
                    className="buscador-cliente-item"
                    onClick={() => handleSeleccionarCliente(cliente)}
                  >
                    <div className="buscador-cliente-item-principal">
                      <span className="buscador-cliente-item-nombre">
                        {cliente.nombre} {cliente.apellido || ''}
                      </span>
                      <span className="buscador-cliente-item-id">
                        #{cliente.id}
                      </span>
                    </div>
                    <div className="buscador-cliente-item-detalles">
                      {cliente.email && (
                        <span className="buscador-cliente-item-detalle">
                          📧 {cliente.email}
                        </span>
                      )}
                      {cliente.telefono && (
                        <span className="buscador-cliente-item-detalle">
                          📞 {cliente.telefono}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="buscador-cliente-sin-resultados">
                <div className="buscador-cliente-sin-resultados-icono">😞</div>
                <p>No se encontraron clientes con "{busqueda}"</p>
                <button
                  className="buscador-cliente-crear-btn"
                  onClick={() => onCrearCliente(busqueda)}
                >
                  ➕ Crear nuevo cliente
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="buscador-cliente-acciones">
        <button
          className="buscador-cliente-btn-crear"
          onClick={() => onCrearCliente('')}
        >
          ➕ Crear Nuevo Cliente
        </button>
      </div>
    </div>
  );
}
