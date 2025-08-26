import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/sidebar";
import DropdownCategoriasSidebar from "../components/SidebarCategorias/DropdownCategoriasSidebar";
import HeaderUserBar from "../components/HeaderUserBar/HeaderUserBar";
import TablaClientes from "../components/TablaClientes/TablaClientes";
import ModalNuevoCliente from "../components/Modals/ModalNuevoCliente";
import "./ClientePage.css";



const ClientePage = () => {
  // Estado local para manejar la sidebar
  const [activeSidebarItem, setActiveSidebarItem] = useState("Clientes");
  const [showDropdownCategorias, setShowDropdownCategorias] = useState(false);
  const navigate = useNavigate();
  
  const [modalNuevoOpen, setModalNuevoOpen] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  const [refrescarClientes, setRefrescarClientes] = useState(0);

  // Establecer el item activo cuando se carga la página
  useEffect(() => {
    setActiveSidebarItem("Clientes");
  }, []);

  // Funciones para manejar la sidebar
  const handleSidebarItemClick = (label) => {
    setActiveSidebarItem(label);
    if (label === "Stock") {
      setShowDropdownCategorias(prev => !prev);
    } else {
      setShowDropdownCategorias(false);
    }
  };

  const closeCategoriasSidebar = () => {
    setShowDropdownCategorias(false);
  };

  const handleSubcategoriaSelect = (subcategoria, categoria) => {
    closeCategoriasSidebar();
    const subcategoriaUrl = subcategoria.nombre.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'y');
    navigate(`/stock/${subcategoriaUrl}`, {
      state: { subcategoria, categoria }
    });
  };

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
      <Sidebar 
        activeItem={activeSidebarItem}
        onItemClick={handleSidebarItemClick}
        keepExpanded={showDropdownCategorias && activeSidebarItem === "Stock"}
      />
      {showDropdownCategorias && (
        <DropdownCategoriasSidebar 
          visible={true}
          onClose={closeCategoriasSidebar}
          onSelectSubcategoria={handleSubcategoriaSelect}
        />
      )}      
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
