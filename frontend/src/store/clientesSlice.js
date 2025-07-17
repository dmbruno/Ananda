import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchClientes = createAsyncThunk(
  "clientes/fetchClientes",
  async () => {
    const response = await axios.get("/api/clientes/");
    return response.data;
  }
);

const clientesSlice = createSlice({
  name: "clientes",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addCliente: (state, action) => {
      state.items.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchClientes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchClientes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { addCliente } = clientesSlice.actions;
export default clientesSlice.reducer;
