import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchSubcategorias = createAsyncThunk(
  "subcategorias/fetchSubcategorias",
  async (categoriaId) => {
    if (!categoriaId) {
      throw new Error("categoriaId is required to fetch subcategories");
    }
    const url = `/api/subcategorias/${categoriaId}`;
    const response = await axios.get(url);
    return response.data;
  }
);

export const addSubcategoria = createAsyncThunk(
  "subcategorias/addSubcategoria",
  async ({ nombre, categoriaId }) => {
    const response = await axios.post("/api/subcategorias/", {
      nombre,
      categoria_id: categoriaId,
    });
    return response.data;
  }
);

export const updateSubcategoria = createAsyncThunk(
  "subcategorias/updateSubcategoria",
  async ({ id, nombre, categoriaId }) => {
    const response = await axios.put(`/api/subcategorias/${id}`, {
      nombre,
      categoria_id: categoriaId,
    });
    return response.data;
  }
);

export const deleteSubcategoria = createAsyncThunk(
  "subcategorias/deleteSubcategoria",
  async ({ id }) => {
    await axios.delete(`/api/subcategorias/${id}`);
    return id;
  }
);

const subcategoriasSlice = createSlice({
  name: "subcategorias",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubcategorias.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSubcategorias.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchSubcategorias.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addSubcategoria.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateSubcategoria.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteSubcategoria.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s.id === action.payload);
        if (idx !== -1) state.items[idx].activo = false;
      });
  },
});

// Selector para subcategorías por categoría
export const selectSubcategoriasByCategoria = (state, categoriaId) =>
  state.subcategorias.items.filter(
    (s) => String(s.categoria_id) === String(categoriaId)
  );

export default subcategoriasSlice.reducer;
