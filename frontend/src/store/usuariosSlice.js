import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Obtener todos los usuarios
export const fetchUsuarios = createAsyncThunk(
  "usuarios/fetchUsuarios",
  async () => {
    const response = await axios.get("/api/usuarios/");
    return response.data;
  }
);

// Crear nuevo usuario
export const createUsuario = createAsyncThunk(
  "usuarios/createUsuario",
  async (usuarioData) => {
    const response = await axios.post("/api/usuarios/", usuarioData);
    return response.data;
  }
);

// Actualizar usuario
export const updateUsuario = createAsyncThunk(
  "usuarios/updateUsuario",
  async ({ id, ...usuarioData }) => {
    const response = await axios.put(`/api/usuarios/${id}`, usuarioData);
    // Retornar el usuario actualizado con el ID
    return { id, ...usuarioData };
  }
);

// Eliminar usuario (Soft Delete)
export const deleteUsuario = createAsyncThunk(
  "usuarios/deleteUsuario",
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`/api/usuarios/${usuarioId}`);
      return { usuarioId, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al eliminar usuario');
    }
  }
);

// Obtener usuario por ID
export const fetchUsuarioById = createAsyncThunk(
  "usuarios/fetchUsuarioById",
  async (usuarioId) => {
    const response = await axios.get(`/api/usuarios/${usuarioId}`);
    return response.data;
  }
);

// Reactivar usuario
export const reactivarUsuario = createAsyncThunk(
  "usuarios/reactivarUsuario",
  async (usuarioId, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/usuarios/${usuarioId}/reactivar`);
      return { usuarioId, response: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Error al reactivar usuario');
    }
  }
);

// Obtener usuarios eliminados
export const fetchUsuariosEliminados = createAsyncThunk(
  "usuarios/fetchUsuariosEliminados",
  async () => {
    const response = await axios.get("/api/usuarios/eliminados");
    return response.data;
  }
);

const usuariosSlice = createSlice({
  name: "usuarios",
  initialState: {
    items: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    selectedUsuario: null,
    usuariosEliminados: [], // Lista de usuarios eliminados para auditoría
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUsuario: (state) => {
      state.selectedUsuario = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch usuarios
      .addCase(fetchUsuarios.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      
      // Create usuario
      .addCase(createUsuario.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(createUsuario.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Agregar el nuevo usuario a la lista
        state.items.push(action.payload);
      })
      .addCase(createUsuario.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      
      // Update usuario
      .addCase(updateUsuario.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateUsuario.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Actualizar el usuario en la lista
        const index = state.items.findIndex(usuario => usuario.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateUsuario.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      
      // Delete usuario
      .addCase(deleteUsuario.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteUsuario.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Remover el usuario de la lista (ya que está eliminado lógicamente)
        state.items = state.items.filter(usuario => usuario.id !== action.payload.usuarioId);
      })
      .addCase(deleteUsuario.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      
      // Fetch usuario by ID
      .addCase(fetchUsuarioById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsuarioById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.selectedUsuario = action.payload;
      })
      .addCase(fetchUsuarioById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      
      // Reactivar usuario
      .addCase(reactivarUsuario.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(reactivarUsuario.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Aquí podrías manejar la reactivación si es necesario
      })
      .addCase(reactivarUsuario.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      
      // Fetch usuarios eliminados
      .addCase(fetchUsuariosEliminados.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUsuariosEliminados.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.usuariosEliminados = action.payload;
      })
      .addCase(fetchUsuariosEliminados.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearError, clearSelectedUsuario } = usuariosSlice.actions;
export default usuariosSlice.reducer;
