import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchUsuarios = createAsyncThunk(
  "usuarios/fetchUsuarios",
  async () => {
    const response = await axios.get("/api/usuarios/");
    return response.data;
  }
);

const usuariosSlice = createSlice({
  name: "usuarios",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addUsuario: (state, action) => {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsuarios.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addUsuario } = usuariosSlice.actions;
export default usuariosSlice.reducer;
