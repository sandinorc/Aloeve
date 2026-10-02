/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("gastos");

  const record0 = new Record(collection);
    record0.set("fecha", "2026-03-01");
    record0.set("categoria", "alquiler");
    record0.set("subcategoria", "Alquiler espacio principal");
    record0.set("monto", 8000);
    record0.set("tipo", "fijo mensual");
    record0.set("comprobante", "REC-ALQ-001");
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
    record1.set("fecha", "2026-03-01");
    record1.set("categoria", "sueldos");
    record1.set("subcategoria", "Salarios equipo");
    record1.set("monto", 10000);
    record1.set("tipo", "fijo mensual");
    record1.set("comprobante", "REC-SUE-001");
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
    record2.set("fecha", "2026-03-01");
    record2.set("categoria", "servicios");
    record2.set("subcategoria", "Servicios b\u00e1sicos (agua, luz, internet)");
    record2.set("monto", 4000);
    record2.set("tipo", "fijo mensual");
    record2.set("comprobante", "REC-SER-001");
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
    record3.set("fecha", "2026-03-05");
    record3.set("categoria", "materiales");
    record3.set("subcategoria", "Materiales para talleres");
    record3.set("monto", 3200);
    record3.set("tipo", "variable por sesion");
    record3.set("comprobante", "REC-MAT-001");
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
    record4.set("fecha", "2026-03-10");
    record4.set("categoria", "bebidas");
    record4.set("subcategoria", "Bebidas para eventos");
    record4.set("monto", 2400);
    record4.set("tipo", "variable por sesion");
    record4.set("comprobante", "REC-BEB-001");
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
    record5.set("fecha", "2026-03-15");
    record5.set("categoria", "decoracion");
    record5.set("subcategoria", "Decoraci\u00f3n eventos especiales");
    record5.set("monto", 2800);
    record5.set("tipo", "variable por sesion");
    record5.set("comprobante", "REC-DEC-001");
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
    record6.set("fecha", "2026-03-20");
    record6.set("categoria", "software");
    record6.set("subcategoria", "Licencias y herramientas digitales");
    record6.set("monto", 1500);
    record6.set("tipo", "fijo mensual");
    record6.set("comprobante", "REC-SOF-001");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("fecha", "2026-03-25");
    record7.set("categoria", "limpieza");
    record7.set("subcategoria", "Servicio de limpieza");
    record7.set("monto", 500);
    record7.set("tipo", "fijo mensual");
    record7.set("comprobante", "REC-LIM-001");
  try {
    app.save(record7);
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