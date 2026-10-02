export const normalizeKey = (key) => {
  if (!key) return '';
  return key.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

export const validateExcelColumns = (headers, type) => {
  const normalizedHeaders = headers.map(normalizeKey);
  
  const requiredMaterials = ['nombre', 'cantidad', 'cantidad minima', 'proveedor'];
  const requiredProducts = ['nombre', 'cantidad', 'cantidad minima', 'precio'];
  
  const required = type === 'material' ? requiredMaterials : requiredProducts;
  
  const missing = required.filter(req => !normalizedHeaders.includes(req));
  
  return missing.map(m => {
    if (m === 'cantidad minima') return 'Cantidad Mínima';
    return m.charAt(0).toUpperCase() + m.slice(1);
  });
};

export const validateMaterialRow = (row, index) => {
  const errors = [];
  
  if (!row.nombre || String(row.nombre).trim() === '') {
    errors.push(`Fila ${index + 1}: El Nombre es obligatorio.`);
  }
  
  const cantidad = parseFloat(row.cantidad);
  if (isNaN(cantidad) || cantidad < 0) {
    errors.push(`Fila ${index + 1}: La Cantidad debe ser un número mayor o igual a 0.`);
  }
  
  const cantidadMinima = parseFloat(row['cantidad minima']);
  if (isNaN(cantidadMinima) || cantidadMinima < 0) {
    errors.push(`Fila ${index + 1}: La Cantidad Mínima debe ser un número mayor o igual a 0.`);
  }
  
  if (!row.proveedor || String(row.proveedor).trim() === '') {
    errors.push(`Fila ${index + 1}: El Proveedor es obligatorio.`);
  }
  
  return errors;
};

export const validateProductRow = (row, index) => {
  const errors = [];
  
  if (!row.nombre || String(row.nombre).trim() === '') {
    errors.push(`Fila ${index + 1}: El Nombre es obligatorio.`);
  }
  
  const cantidad = parseFloat(row.cantidad);
  if (isNaN(cantidad) || cantidad < 0) {
    errors.push(`Fila ${index + 1}: La Cantidad debe ser un número mayor o igual a 0.`);
  }
  
  const cantidadMinima = parseFloat(row['cantidad minima']);
  if (isNaN(cantidadMinima) || cantidadMinima < 0) {
    errors.push(`Fila ${index + 1}: La Cantidad Mínima debe ser un número mayor o igual a 0.`);
  }
  
  const precio = parseFloat(row.precio);
  if (isNaN(precio) || precio < 0) {
    errors.push(`Fila ${index + 1}: El Precio debe ser un número mayor o igual a 0.`);
  }
  
  return errors;
};