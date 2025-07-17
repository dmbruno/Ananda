import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchVentas = createAsyncThunk("ventas/fetchVentas", async () => {
  const response = await axios.get("/api/ventas/");
  return response.data;
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
