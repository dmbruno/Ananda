import axios from '../utils/axios.js';

export async function obtenerProducto(id) {
  const response = await axios.get(`/api/productos/${id}`);
  return response.data;
}

export async function ajustarPreciosMasivos(ajusteData) {
  try {
    const response = await axios.post('/api/productos/ajuste-masivo-precios', ajusteData);
    return response.data;
  } catch (error) {
    console.error('Error en ajuste masivo de precios:', error);
    throw error;
  }
}

export async function actualizarProducto(id, datos) {
  if (datos.imagen) {
    // Si hay imagen, usamos FormData
    const formData = new FormData();
    Object.entries(datos).forEach(([key, value]) => {
      if (key === 'imagen' && value) {
        formData.append('imagen', value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = await axios.put(`/api/productos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } else {
    const response = await axios.put(`/api/productos/${id}`, datos);
    return response.data;
  }
}
