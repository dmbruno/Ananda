import React, { useEffect, useState } from "react";
import "./App.css";
import "./components/Sidebar/sidebar.css";
import "./components/SidebarCategorias/DropdownCategoriasSidebar.css";
import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DashboardPage from "./pages/DashboardPage";
import CategoriasPage from "./pages/CategoriasPage";
import StockPage from "./pages/StockPage";
import GestionCajasPage from "./pages/GestionCajasPage";
import VentasPage from "./pages/VentasPage";
import CarritoPage from "./pages/CarritoPage";
import ClientePage from "./pages/ClientePage";
import VentasHistoricasPage from "./pages/VentasHistoricasPage";
import UsuariosPage from "./pages/UsuariosPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import DefaultRedirect from "./components/DefaultRedirect/DefaultRedirect";
import { getCurrentUser } from "./store/authSlice";
import Loader from "./components/Loader/Loader.jsx";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { ConfirmProvider } from "./utils/confirm/ConfirmContext";

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const location = useLocation(); // 👈 detecta cambios de ruta
  const { isAuthenticated, token } = useSelector((state) => state.auth);

  // Obtener usuario actual al cargar la aplicación
  useEffect(() => {
    // Nota: Los interceptores de axios ahora se configuran automáticamente en utils/axios.js
    if (token && isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  // Loader inicial
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Loader en cada cambio de ruta
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500); // duración de transición
    return () => clearTimeout(timer);
  }, [location]);

  if (loading) return <Loader />;

  return (
    <div className="app-layout">
      <main className="app-main">
        <ConfirmProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />

            {/* Ruta raíz que redirige automáticamente */}
            <Route path="/" element={<DefaultRedirect />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/categorias"
              element={
                <ProtectedRoute>
                  <CategoriasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas/historicas"
              element={
                <ProtectedRoute>
                  <VentasHistoricasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas/nueva"
              element={
                <ProtectedRoute>
                  <CarritoPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventas"
              element={
                <ProtectedRoute>
                  <VentasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clientes"
              element={
                <ProtectedRoute>
                  <ClientePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cumpleanos"
              element={
                <ProtectedRoute>
                  <div>Cumpleaños - En desarrollo</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/carrito"
              element={
                <ProtectedRoute>
                  <div>Carrito - En desarrollo</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cajas"
              element={
                <ProtectedRoute>
                  <GestionCajasPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stock/:subcategoria"
              element={
                <ProtectedRoute>
                  <StockPage />
                </ProtectedRoute>
              }
            />

            {/* Ruta catch-all para páginas no encontradas */}
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            pauseOnHover
            pauseOnFocusLoss
            limit={5}
          />
        </ConfirmProvider>
      </main>
    </div>
  );
}

export default App;
