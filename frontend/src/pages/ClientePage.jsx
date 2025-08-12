import React, { useState } from "react";
import Sidebar from "../components/Sidebar/sidebar";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar";
import TablaClientes from "../components/TablaClientes/TablaClientes";
import ModalNuevoCliente from "../components/Modals/ModalNuevoCliente";
import "./ClientePage.css";



const ClientePage = () => {
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  const [refrescarClientes, setRefrescarClientes] = useState(0);

  const handleEditarCliente = (cliente) => {
    setClienteParaEditar(cliente);
    setModalNuevoOpen(true);
  };

  // Handler para cuando se guarda o edita un cliente
  const handleClienteGuardado = () => {
    setRefrescarClientes((prev) => prev + 1);
    setModalNuevoOpen(false);
  };

  return (
    <div className="cliente-page-layout">
      <Sidebar />
      <div className="cliente-main-content">
        <HeaderUserBar />
        <TablaClientes
          onAgregarCliente={() => {
            setClienteParaEditar(null);
            setModalNuevoOpen(true);
          }}
          onEditarCliente={handleEditarCliente}
          refrescarClientes={refrescarClientes}
        />
      </div>
      <ModalNuevoCliente
        open={modalNuevoOpen}
        onClose={() => setModalNuevoOpen(false)}
        cliente={clienteParaEditar}
        onClienteGuardado={handleClienteGuardado}
      />
    </div>
  );
};

export default ClientePage;
