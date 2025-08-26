import { configureStore } from "@reduxjs/toolkit";
import clientesReducer from "./clientesSlice";
import ventasReducer from "./ventasSlice";
import detalleVentasReducer from "./detalleVentasSlice";
import productosReducer from "./productosSlice";
import categoriasReducer from "./categoriasSlice";
import subcategoriasReducer from "./subcategoriasSlice";
import carritoReducer from "./carritoSlice";
import ventaProcesoReducer from "./ventaProcesoSlice";
import cajaReducer from "./cajaSlice";
import usuariosReducer from "./usuariosSlice";

const store = configureStore({
  reducer: {
    clientes: clientesReducer,
    ventas: ventasReducer,
    detalleVentas: detalleVentasReducer,
    productos: productosReducer,
    categorias: categoriasReducer,
    subcategorias: subcategoriasReducer,
    carrito: carritoReducer,
    ventaProceso: ventaProcesoReducer,
    caja: cajaReducer,
    usuarios: usuariosReducer,
  },
});

export default store;
