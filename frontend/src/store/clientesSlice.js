import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchClientes = createAsyncThunk(
  "clientes/fetchClientes",
  async () => {
    const response = await axios.get("/api/clientes/");
    return response.data;
  }
);

export const addClienteAsync = createAsyncThunk(
  "clientes/addClienteAsync",
  async (nuevoCliente) => {
    const response = await axios.post("/api/clientes/", nuevoCliente);
    return response.data.cliente;
  }
);

export const updateClienteAsync = createAsyncThunk(
  "clientes/updateClienteAsync",
  async ({ id, ...clienteData }) => {
    const response = await axios.put(`/api/clientes/${id}`, clienteData);
    return response.data.cliente;
  }
);

export const marcarClienteSaludado = createAsyncThunk(
  'clientes/marcarSaludado',
  async (clienteId) => {
    const response = await axios.put(`/api/clientes/${clienteId}/marcar-saludado`);
    return { clienteId, ultimo_saludo: response.data.ultimo_saludo };
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
      })
      .addCase(addClienteAsync.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateClienteAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(cliente => cliente.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(marcarClienteSaludado.fulfilled, (state, action) => {
        const { clienteId, ultimo_saludo } = action.payload;
        const cliente = state.items.find(c => c.id === clienteId);
        if (cliente) {
          cliente.ultimo_saludo = ultimo_saludo;
        }
      });
  },
});

export const { addCliente } = clientesSlice.actions;
export default clientesSlice.reducer;
