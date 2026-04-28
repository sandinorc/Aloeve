/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("gastos_fijos_mensuales");

  const record0 = new Record(collection);
    record0.set("categoria", "alquiler");
    record0.set("monto_dop", 15000);
    record0.set("descripcion", "Alquiler del local");
    record0.set("activo", true);
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
    record1.set("categoria", "marketing");
    record1.set("monto_dop", 2000);
    record1.set("descripcion", "Marketing en plaza");
    record1.set("activo", true);
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
    record2.set("categoria", "servicios");
    record2.set("monto_dop", 1500);
    record2.set("descripcion", "Servicios (agua, luz, internet)");
    record2.set("activo", true);
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
    record3.set("categoria", "contabilidad");
    record3.set("monto_dop", 1000);
    record3.set("descripcion", "Servicios de contabilidad");
    record3.set("activo", true);
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
    record4.set("categoria", "sueldos");
    record4.set("monto_dop", 8000);
    record4.set("descripcion", "Sueldos del personal");
    record4.set("activo", true);
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
    record5.set("categoria", "limpieza");
    record5.set("monto_dop", 1500);
    record5.set("descripcion", "Servicios de limpieza");
    record5.set("activo", true);
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("categoria", "software");
    record6.set("monto_dop", 500);
    record6.set("descripcion", "Suscripci\u00f3n software");
    record6.set("activo", true);
  try {
    app.save(record6);
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