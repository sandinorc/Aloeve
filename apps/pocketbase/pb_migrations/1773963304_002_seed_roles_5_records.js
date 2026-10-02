/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("roles");

  const record0 = new Record(collection);
    record0.set("nombre", "Admin");
    record0.set("descripcion", "Administrador con acceso total al sistema");
    record0.set("permisos", "{'users': ['create', 'read', 'update', 'delete'], 'roles': ['create', 'read', 'update', 'delete'], 'studios': ['create', 'read', 'update', 'delete'], 'workshops': ['create', 'read', 'update', 'delete'], 'facilitators': ['create', 'read', 'update', 'delete'], 'sales': ['create', 'read', 'update', 'delete'], 'pos': ['create', 'read', 'update', 'delete'], 'reports': ['read']}");
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
    record1.set("descripcion", "Fundadora con acceso total al sistema");
    record1.set("permisos", "{'users': ['create', 'read', 'update', 'delete'], 'roles': ['create', 'read', 'update', 'delete'], 'studios': ['create', 'read', 'update', 'delete'], 'workshops': ['create', 'read', 'update', 'delete'], 'facilitators': ['create', 'read', 'update', 'delete'], 'sales': ['create', 'read', 'update', 'delete'], 'pos': ['create', 'read', 'update', 'delete'], 'reports': ['read']}");
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
    record2.set("descripcion", "Gerente de estudio con permisos de gesti\u00f3n de estudios, talleres y facilitadores");
    record2.set("permisos", "{'studios': ['read', 'update'], 'workshops': ['create', 'read', 'update', 'delete'], 'facilitators': ['create', 'read', 'update', 'delete'], 'reports': ['read']}");
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
    record3.set("descripcion", "Vendedor con permisos de ventas y punto de venta");
    record3.set("permisos", "{'sales': ['create', 'read', 'update'], 'pos': ['create', 'read', 'update'], 'reports': ['read']}");
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
    record4.set("descripcion", "Empleado con permisos de lectura b\u00e1sica");
    record4.set("permisos", "{'studios': ['read'], 'workshops': ['read'], 'facilitators': ['read'], 'sales': ['read'], 'reports': ['read']}");
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