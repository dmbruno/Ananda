import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchCategorias = createAsyncThunk(
  "categorias/fetchCategorias",
  async () => {
    const response = await axios.get("/api/categorias/");
    return response.data;
  }
);

const categoriasSlice = createSlice({
  name: "categorias",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addCategoria: (state, action) => {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategorias.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategorias.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// Selector para obtener todas las categorías
export const selectCategorias = (state) => state.categorias.items;

export const { addCategoria } = categoriasSlice.actions;
export default categoriasSlice.reducer;
