import axios from "axios";

export const getCategorias = async () => {
  const res = await axios.get("/api/categorias");
  return res.data;
};

export const getSubcategorias = async (categoriaId) => {
  const res = await axios.get(`/api/categorias/${categoriaId}/subcategorias`);
  return res.data;
};
