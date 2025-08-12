// Adaptador para agregar datos de cliente a una venta
import { getClientes } from "./clientes";

// Enriquece los datos de venta con información completa del cliente
export const enriquecerVentaConDatosDeCliente = async (venta) => {
  if (!venta || !venta.cliente_id) return venta;
  
  try {
    const clientes = await getClientes();
    const cliente = clientes.find(c => c.id === venta.cliente_id);
    
    if (cliente) {
      return {
        ...venta,
        cliente_nombre: `${cliente.nombre} ${cliente.apellido}`,
        cliente_telefono: cliente.telefono || "-"
      };
    }
    
    return venta;
  } catch (error) {
    console.error("Error al enriquecer datos de venta con cliente:", error);
    return venta;
  }
};

// Enriquece múltiples ventas con datos de cliente
export const enriquecerVentasConDatosDeCliente = async (ventas) => {
  if (!ventas || ventas.length === 0) return ventas;
  
  try {
    const clientes = await getClientes();
    
    return ventas.map(venta => {
      if (!venta.cliente_id) return venta;
      
      const cliente = clientes.find(c => c.id === venta.cliente_id);
      if (cliente) {
        return {
          ...venta,
          cliente_nombre: `${cliente.nombre} ${cliente.apellido}`,
          cliente_telefono: cliente.telefono || "-"
        };
      }
      return venta;
    });
  } catch (error) {
    console.error("Error al enriquecer ventas con datos de cliente:", error);
    return ventas;
  }
};
