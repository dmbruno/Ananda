import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { enriquecerVentasConDatosDeCliente } from "../api/ventasUtils";

export const fetchVentas = createAsyncThunk("ventas/fetchVentas", async () => {
  const response = await axios.get("/api/ventas/");
  // Enriquecer las ventas con datos completos del cliente
  const ventasEnriquecidas = await enriquecerVentasConDatosDeCliente(response.data);
  return ventasEnriquecidas;
});

const ventasSlice = createSlice({
  name: "ventas",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addVenta: (state, action) => {
      state.items.push(action.payload);
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
      })
      .addCase(fetchVentas.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addVenta } = ventasSlice.actions;
export default ventasSlice.reducer;
