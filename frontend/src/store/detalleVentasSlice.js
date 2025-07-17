import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchDetalleVentas = createAsyncThunk(
  "detalleVentas/fetchDetalleVentas",
  async () => {
    const response = await axios.get("/api/detalle_ventas/");
    return response.data;
  }
);

const detalleVentasSlice = createSlice({
  name: "detalleVentas",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addDetalleVenta: (state, action) => {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDetalleVentas.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchDetalleVentas.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchDetalleVentas.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addDetalleVenta } = detalleVentasSlice.actions;
export default detalleVentasSlice.reducer;
