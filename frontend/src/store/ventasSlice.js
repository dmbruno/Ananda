import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { enriquecerVentasConDatosDeCliente } from "../api/ventasUtils";

export const fetchVentas = createAsyncThunk("ventas/fetchVentas", async () => {
  const response = await axios.get("/api/ventas/");
  // Enriquecer las ventas con datos completos del cliente
  const ventasEnriquecidas = await enriquecerVentasConDatosDeCliente(response.data);
  return ventasEnriquecidas;
});

export const eliminarVenta = createAsyncThunk(
  "ventas/eliminarVenta",
  async (ventaId) => {
    await axios.delete(`/api/ventas/${ventaId}`);
    return ventaId;
  }
);

const ventasSlice = createSlice({
  name: "ventas",
  initialState: {
    items: [],
    status: "idle",
    error: null,
    nuevaVentaRealizada: false,
  },
  reducers: {
    addVenta: (state, action) => {
      state.items.push(action.payload);
    },
    nuevaVentaRealizada: (state, action) => {
      state.nuevaVentaRealizada = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVentas.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchVentas.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
        state.nuevaVentaRealizada = false;
      })
      .addCase(fetchVentas.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(eliminarVenta.fulfilled, (state, action) => {
        state.items = state.items.filter(venta => venta.id !== action.payload);
      })
      .addCase(eliminarVenta.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { addVenta, nuevaVentaRealizada } = ventasSlice.actions;
export default ventasSlice.reducer;
