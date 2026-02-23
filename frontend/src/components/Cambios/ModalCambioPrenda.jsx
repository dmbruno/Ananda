import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BuscadorProducto from '../CarritoPage/CarritoPanel/BuscadorProducto';
import './ModalCambioPrenda.css';
import notify from '../../utils/notify';
import { fetchProductos } from '../../store/productosSlice';
import { fetchVentas } from '../../store/ventasSlice';
import { obtenerCajaActual } from '../../store/cajaSlice';
import { fetchClientes } from '../../store/clientesSlice';

const METODOS_PAGO = [
  { value: 'FT', label: 'Efectivo', icon: '💵' },
  { value: 'TC', label: 'Tarjeta', icon: '💳' },
  { value: 'TB', label: 'Transferencia', icon: '📱' },
];

const ModalCambioPrenda = ({ isOpen, onClose, ventaId, detalleId, productoOriginal, clienteInicial }) => {
  const dispatch = useDispatch();
  const { items: productos = [] } = useSelector((state) => state.productos);
  const { cliente } = useSelector((state) => state.ventaProceso);
  const { cajaActual } = useSelector((state) => state.caja);
  const { items: clientes = [] } = useSelector((state) => state.clientes || { items: [] });

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clienteSugerencias, setClienteSugerencias] = useState([]);
  const [mostrarClientes, setMostrarClientes] = useState(false);
  const [productoDevuelto, setProductoDevuelto] = useState(null);
  const [productoNuevo, setProductoNuevo] = useState(null);
  const [metodoPago, setMetodoPago] = useState('FT');
  const [busquedaDevuelto, setBusquedaDevuelto] = useState('');
  const [busquedaNuevo, setBusquedaNuevo] = useState('');
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('[CAMBIO] Modal abierto. Cliente en ventaProceso:', cliente);
      if (!productos || productos.length === 0) {
        console.log('[CAMBIO] No hay productos cargados, disparando fetchProductos');
        dispatch(fetchProductos());
      }
      dispatch(obtenerCajaActual());
      dispatch(fetchClientes());

      // Si viene clienteInicial desde una venta concreta, usarlo
      if (clienteInicial) {
        setClienteSeleccionado(clienteInicial);
        setBusquedaCliente('');
      } else if (cliente) {
        setClienteSeleccionado(cliente);
      }

      // Si viene productoOriginal (modo cambio desde venta), fijarlo como producto devuelto
      if (productoOriginal) {
        console.log('[CAMBIO] Modo cambio desde venta. Producto original:', productoOriginal);
        setProductoDevuelto(productoOriginal);
      }
    }
  }, [isOpen, dispatch, cliente, productos, clienteInicial, productoOriginal]);

  useEffect(() => {
    if (!isOpen) {
      setProductoDevuelto(null);
      setProductoNuevo(null);
      setMetodoPago('FT');
      setBusquedaDevuelto('');
      setBusquedaNuevo('');
      setProcesando(false);
      setClienteSeleccionado(null);
      setBusquedaCliente('');
      setClienteSugerencias([]);
      setMostrarClientes(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (busquedaCliente.trim() && clientes.length > 0) {
      const q = busquedaCliente.toLowerCase();
      const filtrados = clientes.filter((c) => {
        const nombre = `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase();
        const telefono = (c.telefono || '').toLowerCase();
        return nombre.includes(q) || telefono.includes(q);
      }).slice(0, 8);
      setClienteSugerencias(filtrados);
      setMostrarClientes(true);
    } else {
      setClienteSugerencias([]);
      setMostrarClientes(false);
    }
  }, [busquedaCliente, clientes]);

  if (!isOpen) return null;

  const precioDevuelto = productoDevuelto?.precio_venta || 0;
  const precioNuevo = productoNuevo?.precio_venta || 0;
  const saldo = precioNuevo - precioDevuelto;

  const handleSeleccionProductoDevuelto = (producto) => {
    console.log('[CAMBIO] Producto devuelto seleccionado:', producto);
    setProductoDevuelto(producto);
  };

  const handleSeleccionProductoNuevo = (producto) => {
    console.log('[CAMBIO] Producto nuevo seleccionado:', producto);
    setProductoNuevo(producto);
  };

  const handleSeleccionCliente = (c) => {
    console.log('[CAMBIO] Cliente seleccionado en modal:', c);
    setClienteSeleccionado(c);
    setBusquedaCliente('');
    setMostrarClientes(false);
  };

  const handleCerrar = () => {
    if (procesando) {
      console.log('[CAMBIO] Cierre solicitado mientras procesando, reseteando flag');
      setProcesando(false);
    }
    onClose();
  };

  const handleConfirmar = async () => {
    try {
      console.log('[CAMBIO] Confirmar cambio. Estado actual:', {
        clienteContexto: cliente,
        clienteSeleccionado,
        productoDevuelto,
        productoNuevo,
        saldo,
        cajaActual,
        metodoPago,
        ventaId,
        detalleId,
      });

      if (!productoDevuelto) {
        notify.warn('Seleccioná el producto que se devuelve.');
        return;
      }

      if (!productoNuevo) {
        notify.warn('Seleccioná el producto que el cliente se lleva.');
        return;
      }

      // En modo vinculado a venta, caja se toma de la venta (no usamos cajaActual directamente para validar)
      if (!ventaId || !detalleId) {
        notify.warn('Este cambio debe partir de una venta seleccionada.');
        return;
      }

      setProcesando(true);

      const token = localStorage.getItem('access_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Si la diferencia es <= 0, no hay movimiento de caja; si es > 0, se usa metodoPago como metodo_pago_diferencia
      const payload = {
        detalle_id: detalleId,
        producto_nuevo_id: productoNuevo.id,
        cantidad: 1,
        metodo_pago_diferencia: metodoPago,
      };

      console.log('[CAMBIO] Payload /api/ventas/cambiar-producto:', payload, 'ventaId:', ventaId);

      const resp = await fetch(`/api/ventas/${ventaId}/cambiar-producto`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const texto = await resp.text();
      console.log('[CAMBIO] Respuesta cambiar-producto', { status: resp.status, body: texto });

      if (!resp.ok) {
        let data = {};
        try {
          data = JSON.parse(texto);
        } catch (e) {}
        throw new Error(data.error || 'Error al procesar el cambio de producto en la venta');
      }

      let dataResp = {};
      try {
        dataResp = JSON.parse(texto);
      } catch (e) {}

      // Notificación según diferencia
      if (saldo > 0) {
        notify.success(
          `Cambio registrado. Diferencia a pagar de $${saldo.toLocaleString('es-AR')} aplicada a la venta #${ventaId}.`
        );
      } else if (saldo < 0) {
        notify.success(
          `Cambio registrado. Nota de crédito interna por $${Math.abs(saldo).toLocaleString('es-AR')} en la venta #${ventaId}.`
        );
      } else {
        notify.success(`Cambio registrado sin diferencia de precio en la venta #${ventaId}.`);
      }

      dispatch(fetchProductos());
      dispatch(fetchVentas());
      dispatch(obtenerCajaActual());

      onClose();
    } catch (error) {
      console.error('Error al procesar cambio:', error);
      notify.error(error.message || 'Error al procesar el cambio');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="modal-cambio-backdrop" onClick={handleCerrar}>
      <div className="modal-cambio-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cambio-header">
          <div className="modal-cambio-titulos">
            <h2 className="modal-cambio-titulo">Cambio de prendas</h2>
          </div>
          <button className="modal-cambio-close" onClick={handleCerrar}>
            ×
          </button>
        </div>

        <div className="modal-cambio-body">
          {/* Selector de cliente en el propio modal */}
          <div className="modal-cambio-cliente">
            <label className="modal-cambio-cliente-label">Cliente</label>
            <div className="modal-cambio-cliente-input-wrapper">
              <input
                type="text"
                className="modal-cambio-cliente-input"
                placeholder={
                  clienteSeleccionado
                    ? `${clienteSeleccionado.nombre || ''} ${
                        clienteSeleccionado.apellido || ''
                      }`.trim()
                    : 'Buscar cliente por nombre o teléfono...'
                }
                value={busquedaCliente}
                onChange={(e) => setBusquedaCliente(e.target.value)}
                onFocus={() => busquedaCliente && setMostrarClientes(true)}
              />
            </div>
            {mostrarClientes && clienteSugerencias.length > 0 && (
              <div className="modal-cambio-cliente-sugerencias">
                {clienteSugerencias.map((c) => (
                  <div
                    key={c.id}
                    className="modal-cambio-cliente-item"
                    onClick={() => handleSeleccionCliente(c)}
                  >
                    <span className="modal-cambio-cliente-nombre">
                      {`${c.nombre || ''} ${c.apellido || ''}`.trim() || `Cliente #${c.id}`}
                    </span>
                    {c.telefono && (
                      <span className="modal-cambio-cliente-telefono">{c.telefono}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-cambio-grid">
            <div className="modal-cambio-col">
              <h3 className="modal-cambio-label">Producto que se devuelve</h3>
              <BuscadorProducto
                productos={productos}
                busqueda={busquedaDevuelto}
                onBusquedaChange={setBusquedaDevuelto}
                onProductoSelect={handleSeleccionProductoDevuelto}
                disabled={!!productoOriginal}
              />

              {productoDevuelto && (
                <div className="modal-cambio-producto-card">
                  <div className="modal-cambio-producto-nombre">{productoDevuelto.nombre}</div>
                  <div className="modal-cambio-producto-detalles">
                    <span>Talle: {productoDevuelto.talle || '-'}</span>
                    <span>
                      Precio: ${precioDevuelto.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-cambio-col">
              <h3 className="modal-cambio-label">Producto que se lleva</h3>
              <BuscadorProducto
                productos={productos}
                busqueda={busquedaNuevo}
                onBusquedaChange={setBusquedaNuevo}
                onProductoSelect={handleSeleccionProductoNuevo}
              />

              {productoNuevo && (
                <div className="modal-cambio-producto-card">
                  <div className="modal-cambio-producto-nombre">{productoNuevo.nombre}</div>
                  <div className="modal-cambio-producto-detalles">
                    <span>Talle: {productoNuevo.talle || '-'}</span>
                    <span>
                      Precio: ${precioNuevo.toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {(productoDevuelto || productoNuevo) && (
            <div className="modal-cambio-resumen">
              <div className="modal-cambio-resumen-linea">
                <span>Precio devuelto</span>
                <span>${precioDevuelto.toLocaleString('es-AR')}</span>
              </div>
              <div className="modal-cambio-resumen-linea">
                <span>Precio nuevo</span>
                <span>${precioNuevo.toLocaleString('es-AR')}</span>
              </div>
              <div className="modal-cambio-resumen-linea total">
                <span>{saldo > 0 ? 'Saldo a pagar' : 'Saldo a favor'}</span>
                <span className={saldo > 0 ? 'monto-positivo' : 'monto-negativo'}>
                  ${Math.abs(saldo).toLocaleString('es-AR')}
                </span>
              </div>

              {saldo <= 0 && (
                <div className="modal-cambio-nota-credito">
                  Realizar Nota de Crédito por{' '}
                  <span>
                    ${Math.abs(saldo).toLocaleString('es-AR')}
                  </span>
                </div>
              )}

              {saldo > 0 && (
                <div className="modal-cambio-metodos-pago">
                  <span className="modal-cambio-metodos-label">Método de pago</span>
                  <div className="modal-cambio-metodos-grid">
                    {METODOS_PAGO.map((m) => (
                      <button
                        key={m.value}
                        type="button"
                        className={`modal-cambio-metodo ${
                          metodoPago === m.value ? 'activo' : ''
                        }`}
                        onClick={() => setMetodoPago(m.value)}
                      >
                        <span className="modal-cambio-metodo-icono">{m.icon}</span>
                        <span className="modal-cambio-metodo-texto">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-cambio-footer">
          <button
            className="modal-cambio-btn-cancelar"
            type="button"
            onClick={handleCerrar}
            disabled={procesando}
          >
            Cancelar
          </button>
          <button
            className="modal-cambio-btn-confirmar"
            type="button"
            onClick={handleConfirmar}
            disabled={procesando || !productoDevuelto || !productoNuevo}
          >
            {procesando ? 'Procesando...' : 'Confirmar cambio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambioPrenda;
