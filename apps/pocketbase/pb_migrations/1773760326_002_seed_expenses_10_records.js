/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("expenses");

  const record0 = new Record(collection);
    record0.set("date", "2026-03-01");
    record0.set("category", "alquiler");
    record0.set("subcategory", "Alquiler estudio");
    record0.set("amount_dop", 35000);
    record0.set("type", "fijo mensual");
    record0.set("receipt_number", "FAC-001");
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
    record1.set("date", "2026-03-01");
    record1.set("category", "sueldos");
    record1.set("subcategory", "Salario asistente");
    record1.set("amount_dop", 18000);
    record1.set("type", "fijo mensual");
    record1.set("receipt_number", "REC-001");
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
    record2.set("date", "2026-03-02");
    record2.set("category", "servicios");
    record2.set("subcategory", "Electricidad");
    record2.set("amount_dop", 3500);
    record2.set("type", "fijo mensual");
    record2.set("receipt_number", "FAC-002");
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
    record3.set("date", "2026-03-02");
    record3.set("category", "servicios");
    record3.set("subcategory", "Internet");
    record3.set("amount_dop", 1500);
    record3.set("type", "fijo mensual");
    record3.set("receipt_number", "FAC-003");
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
    record4.set("date", "2026-03-05");
    record4.set("category", "materiales");
    record4.set("subcategory", "Pinturas y lienzos");
    record4.set("amount_dop", 4200);
    record4.set("type", "variable por sesi\u00f3n");
    record4.set("receipt_number", "FAC-004");
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
    record5.set("date", "2026-03-08");
    record5.set("category", "marketing plaza");
    record5.set("subcategory", "Publicidad Instagram");
    record5.set("amount_dop", 2000);
    record5.set("type", "variable por sesi\u00f3n");
    record5.set("receipt_number", "REC-002");
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
    record6.set("date", "2026-03-10");
    record6.set("category", "limpieza");
    record6.set("subcategory", "Servicio limpieza");
    record6.set("amount_dop", 2500);
    record6.set("type", "fijo mensual");
    record6.set("receipt_number", "FAC-005");
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
    record7.set("date", "2026-03-15");
    record7.set("category", "software");
    record7.set("subcategory", "Suscripci\u00f3n Canva Pro");
    record7.set("amount_dop", 800);
    record7.set("type", "fijo mensual");
    record7.set("receipt_number", "FAC-006");
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("date", "2026-03-18");
    record8.set("category", "bebidas");
    record8.set("subcategory", "Bebidas para evento");
    record8.set("amount_dop", 1800);
    record8.set("type", "variable por sesi\u00f3n");
    record8.set("receipt_number", "REC-003");
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("date", "2026-03-25");
    record9.set("category", "decoraci\u00f3n");
    record9.set("subcategory", "Decoraci\u00f3n especial");
    record9.set("amount_dop", 3000);
    record9.set("type", "extraordinario");
    record9.set("receipt_number", "FAC-007");
  try {
    app.save(record9);
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