// Funciones para llamar al backend (ejemplo para clientes)
import axios from "axios";

export const getClientes = async () => {
  const response = await axios.get("/api/clientes");
  return response.data;
};
