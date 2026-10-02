/// <reference path="../pb_data/types.d.ts" />
// Audit hook to verify usuarios collection integrity after migration
// Runs on any record operation to ensure data quality

onRecordCreate((e) => {
  // Validate required fields on usuario creation
  const email = e.record.get("email");
  const nombreCompleto = e.record.get("nombre_completo");
  const rol = e.record.get("rol");
  const estado = e.record.get("estado");
  
  // Ensure email is not empty
  if (!email || email.trim() === "") {
    throw new BadRequestError("Email is required for usuarios");
  }
  
  // Ensure nombre_completo is not empty
  if (!nombreCompleto || nombreCompleto.trim() === "") {
    throw new BadRequestError("nombre_completo is required for usuarios");
  }
  
  // Ensure rol is set
  if (!rol || rol.trim() === "") {
    throw new BadRequestError("rol is required for usuarios");
  }
  
  // Ensure estado is set
  if (!estado || estado.trim() === "") {
    throw new BadRequestError("estado is required for usuarios");
  }
  
  // Check for duplicate email in usuarios collection
  try {
    const existingUser = $app.findFirstRecordByData("usuarios", "email", email);
    if (existingUser && existingUser.id !== e.record.id) {
      throw new BadRequestError("Email already exists in usuarios collection");
    }
  } catch (err) {
    // Email doesn't exist yet, which is good
  }
  
  e.next();
}, "usuarios");

onRecordUpdate((e) => {
  // Validate email uniqueness on update
  const email = e.record.get("email");
  const recordId = e.record.id;
  
  if (email && email.trim() !== "") {
    try {
      const existingUser = $app.findFirstRecordByData("usuarios", "email", email);
      if (existingUser && existingUser.id !== recordId) {
        throw new BadRequestError("Email already exists in usuarios collection");
      }
    } catch (err) {
      // Email is unique, proceed
    }
  }
  
  e.next();
}, "usuarios");