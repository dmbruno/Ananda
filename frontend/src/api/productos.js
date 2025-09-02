export async function obtenerProducto(id) {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Error al obtener producto');
  return res.json();
}
// API para productos
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/productos';

export async function ajustarPreciosMasivos(ajusteData) {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_URL}/ajuste-masivo-precios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ajusteData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al ajustar precios');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en ajuste masivo de precios:', error);
    throw error;
  }
}

export async function actualizarProducto(id, datos) {
  let body;
  let headers = {};
  if (datos.imagen) {
    // Si hay imagen, usamos FormData
    body = new FormData();
    Object.entries(datos).forEach(([key, value]) => {
      if (key === 'imagen' && value) {
        body.append('imagen', value);
      } else if (value !== undefined && value !== null) {
        body.append(key, value);
      }
    });
    // No seteamos Content-Type, el navegador lo hace
  } else {
    body = JSON.stringify(datos);
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    body,
    headers,
  });
  if (!res.ok) throw new Error('Error al actualizar producto');
  return res.json();
}
