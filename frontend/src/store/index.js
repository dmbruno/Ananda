import { configureStore } from "@reduxjs/toolkit";
import clientesReducer from "./clientesSlice";
import ventasReducer from "./ventasSlice";
import detalleVentasReducer from "./detalleVentasSlice";
import productosReducer from "./productosSlice";
import categoriasReducer from "./categoriasSlice";
import subcategoriasReducer from "./subcategoriasSlice";

const store = configureStore({
  reducer: {
    clientes: clientesReducer,
    ventas: ventasReducer,
    detalleVentas: detalleVentasReducer,
    productos: productosReducer,
    categorias: categoriasReducer,
    subcategorias: subcategoriasReducer,
  },
});

export default store;
