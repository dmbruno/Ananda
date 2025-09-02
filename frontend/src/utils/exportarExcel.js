import * as XLSX from 'xlsx';

export function exportarStockAExcel(productos, nombreArchivo = 'stock.xlsx') {
  if (!productos || productos.length === 0) return;
  // Eliminar campos innecesarios y formatear
  const data = productos.map(({ id, nombre, sku, categoria, talle, color, marca, temporada, costo, precioVenta, stock, estado, ingreso }) => ({
    ID: id,
    Nombre: nombre,
    SKU: sku,
    Categoría: categoria,
    Talle: talle,
    Color: color,
    Marca: marca,
    Temporada: temporada,
    Costo: costo,
    'Precio Venta': precioVenta,
    Stock: stock,
    Estado: estado,
    Ingreso: ingreso
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock');
  XLSX.writeFile(wb, nombreArchivo);
}

export function exportarVentasAExcel(ventas, nombreArchivo = 'ventas.xlsx') {
  if (!ventas || ventas.length === 0) return;
  
  // Formatear los datos de ventas para Excel
  const data = ventas.map((venta) => ({
    Fecha: venta.date,
    'Total Ventas': venta.total,
    'Total Formateado': `$${venta.total.toLocaleString()}`
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  
  // Ajustar anchos de columnas
  const columnsWidth = [
    { wch: 15 }, // Fecha
    { wch: 15 }, // Total Ventas
    { wch: 20 }, // Total Formateado
  ];
  ws['!cols'] = columnsWidth;
  
  // Crear libro y añadir la hoja
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
  
  // Escribir archivo y descargarlo
  XLSX.writeFile(wb, nombreArchivo);
}
