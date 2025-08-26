// Funciones para llamar al backend (ejemplo para clientes)
import axios from "axios";

export const getClientes = async () => {
  const response = await axios.get("/api/clientes");
  return response.data;
};

/**
 * Marca a un cliente como saludado por su cumpleaños
 * @param {number} clienteId - ID del cliente a marcar como saludado
 * @returns {Promise<object>} - Respuesta del servidor con información sobre el registro de saludo
 */
export const marcarClienteSaludado = async (clienteId) => {
  try {
    const response = await axios.post(`/api/clientes/${clienteId}/saludar`);
    return response.data;
  } catch (error) {
    console.error('Error al marcar cliente como saludado:', error);
    throw error;
  }
};
