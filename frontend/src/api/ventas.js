import axios from 'axios';

// Obtener todas las ventas
export const fetchVentas = async () => {
  const response = await axios.get('/api/ventas/');
  return response.data;
};

// Obtener una venta por id
export const getVentaPorId = async (id) => {
  const response = await axios.get(`/api/ventas/${id}`);
  return response.data;
};

// Obtener detalles de una venta específica
export const getDetallesVenta = async (ventaId) => {
  const response = await axios.get(`/api/ventas/${ventaId}/detalles`);
  return response.data;
};

// Crear una nueva venta
export const crearVenta = async (ventaData) => {
  const response = await axios.post('/api/ventas/', ventaData);
  return response.data;
};

// Actualizar una venta existente
export const actualizarVenta = async (id, ventaData) => {
  const response = await axios.put(`/api/ventas/${id}`, ventaData);
  return response.data;
};

// Eliminar una venta
export const eliminarVenta = async (id) => {
  const response = await axios.delete(`/api/ventas/${id}`);
  return response.data;
};
