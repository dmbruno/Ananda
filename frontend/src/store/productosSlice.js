import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

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
  },
  reducers: {
    addProducto: (state, action) => {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductos.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductos.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProductos.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addProducto } = productosSlice.actions;
export default productosSlice.reducer;
