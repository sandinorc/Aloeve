/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("roles");

  const record0 = new Record(collection);
    record0.set("nombre", "Admin");
    record0.set("descripcion", "Acceso total al sistema");
    record0.set("permisos", ["crear_usuarios", "editar_usuarios", "eliminar_usuarios", "gestionar_roles", "gestionar_sesiones", "gestionar_facilitadores", "gestionar_inventario", "ver_reportes", "crear_ventas", "ver_inventario", "registrar_asistencia"]);
    record0.set("estado", true);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("nombre", "Fundadora");
    record1.set("descripcion", "Fundadora con acceso completo");
    record1.set("permisos", ["crear_usuarios", "editar_usuarios", "eliminar_usuarios", "gestionar_roles", "gestionar_sesiones", "gestionar_facilitadores", "gestionar_inventario", "ver_reportes", "crear_ventas", "ver_inventario", "registrar_asistencia"]);
    record1.set("estado", true);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("nombre", "StudioManager");
    record2.set("descripcion", "Gerente de estudio");
    record2.set("permisos", ["gestionar_sesiones", "gestionar_facilitadores", "ver_reportes"]);
    record2.set("estado", true);
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("nombre", "Vendedor");
    record3.set("descripcion", "Vendedor de productos");
    record3.set("permisos", ["crear_ventas", "ver_inventario"]);
    record3.set("estado", true);
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("nombre", "Empleado");
    record4.set("descripcion", "Empleado general");
    record4.set("permisos", ["ver_sesiones", "registrar_asistencia"]);
    record4.set("estado", true);
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})