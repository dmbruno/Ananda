import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { ajustarPreciosMasivos } from "../api/productos";

export const aplicarAjusteMasivo = createAsyncThunk(
  'productos/ajusteMasivo',
  async (ajusteData, { rejectWithValue }) => {
    try {
      const response = await ajustarPreciosMasivos(ajusteData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchProductos = createAsyncThunk(
  "productos/fetchProductos",
  async () => {
    const response = await axios.get("/api/productos/");
    return response.data;
  }
);

const productosSlice = createSlice({
  name: "productos",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    ajusteMasivoStatus: "idle",
    ajusteMasivoError: null,
    ajusteMasivoMensaje: "",
  },
  reducers: {
    addProducto: (state, action) => {
      state.items.push(action.payload);
    },
    updateProducto: (state, action) => {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
    },
    resetAjusteMasivoStatus: (state) => {
      state.ajusteMasivoStatus = "idle";
      state.ajusteMasivoError = null;
      state.ajusteMasivoMensaje = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        console.log('Datos recuperados del backend:', action.payload);
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(aplicarAjusteMasivo.pending, (state) => {
        state.ajusteMasivoStatus = "loading";
        state.ajusteMasivoError = null;
      })
      .addCase(aplicarAjusteMasivo.fulfilled, (state, action) => {
        state.ajusteMasivoStatus = "succeeded";
        state.ajusteMasivoMensaje = action.payload.mensaje;
        // Recargar productos para reflejar los nuevos precios
        state.status = "idle";  // Esto forzará una recarga en componentes que usan fetchProductos
      })
      .addCase(aplicarAjusteMasivo.rejected, (state, action) => {
        state.ajusteMasivoStatus = "failed";
        state.ajusteMasivoError = action.payload;
      });
  },
});

export const { addProducto, updateProducto, resetAjusteMasivoStatus } = productosSlice.actions;
export default productosSlice.reducer;
