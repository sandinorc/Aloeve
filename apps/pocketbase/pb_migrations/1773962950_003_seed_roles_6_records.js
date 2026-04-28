/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("roles");

  const record0 = new Record(collection);
    record0.set("nombre", "Admin");
    record0.set("descripcion", "Administrador con acceso completo al sistema");
    record0.set("permisos", ["dashboard", "punto_venta", "crear_venta", "editar_venta", "eliminar_venta", "inventario", "editar_inventario", "cargar_inventario", "usuarios", "crear_usuario", "editar_usuario", "cambiar_rol", "eliminar_usuario", "reportes", "configuracion", "gestionar_roles"]);
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
    record1.set("descripcion", "Fundadora con acceso completo excepto gesti\u00f3n de roles");
    record1.set("permisos", ["dashboard", "punto_venta", "crear_venta", "editar_venta", "eliminar_venta", "inventario", "editar_inventario", "cargar_inventario", "usuarios", "crear_usuario", "editar_usuario", "cambiar_rol", "eliminar_usuario", "reportes", "configuracion"]);
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
    record2.set("descripcion", "Gerente de estudio con acceso a operaciones b\u00e1sicas");
    record2.set("permisos", ["dashboard", "punto_venta", "inventario", "editar_inventario", "cargar_inventario", "reportes"]);
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
    record3.set("descripcion", "Vendedor con acceso a punto de venta");
    record3.set("permisos", ["punto_venta", "crear_venta", "editar_venta"]);
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
    record4.set("descripcion", "Empleado con acceso limitado a punto de venta");
    record4.set("permisos", ["punto_venta", "crear_venta"]);
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

  const record5 = new Record(collection);
    record5.set("nombre", "Vendedora");
    record5.set("descripcion", "Vendedora con acceso limitado a punto de venta");
    record5.set("permisos", ["punto_venta", "crear_venta"]);
    record5.set("estado", true);
  try {
    app.save(record5);
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