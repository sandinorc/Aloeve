/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("incomes");

  const record0 = new Record(collection);
    record0.set("date", "2026-03-05");
    record0.set("business_line", "L1-Experiencias regulares");
    record0.set("description", "Experiencia regular - Grupo A");
    record0.set("amount_dop", 15000);
    record0.set("participants", 8);
    record0.set("payment_method", "transferencia");
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
    record1.set("date", "2026-03-08");
    record1.set("business_line", "L2-Formaci\u00f3n");
    record1.set("description", "Formaci\u00f3n taller pintura");
    record1.set("amount_dop", 8000);
    record1.set("participants", 5);
    record1.set("payment_method", "efectivo");
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
    record2.set("date", "2026-03-10");
    record2.set("business_line", "L3-Privados");
    record2.set("description", "Sesi\u00f3n privada dise\u00f1o");
    record2.set("amount_dop", 12000);
    record2.set("participants", 1);
    record2.set("payment_method", "tarjeta");
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
    record3.set("date", "2026-03-12");
    record3.set("business_line", "L4-Turismo");
    record3.set("description", "Tour tur\u00edstico creativo");
    record3.set("amount_dop", 20000);
    record3.set("participants", 12);
    record3.set("payment_method", "transferencia");
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
    record4.set("date", "2026-03-15");
    record4.set("business_line", "L5-Corporativo");
    record4.set("description", "Taller corporativo empresa X");
    record4.set("amount_dop", 25000);
    record4.set("participants", 15);
    record4.set("payment_method", "transferencia");
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
    record5.set("date", "2026-03-18");
    record5.set("business_line", "L1-Experiencias regulares");
    record5.set("description", "Experiencia regular - Grupo B");
    record5.set("amount_dop", 14000);
    record5.set("participants", 7);
    record5.set("payment_method", "efectivo");
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
    record6.set("date", "2026-03-22");
    record6.set("business_line", "L6-Venta de productos");
    record6.set("description", "Venta de productos art\u00edsticos");
    record6.set("amount_dop", 5000);
    record6.set("payment_method", "tarjeta");
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
    record7.set("date", "2026-03-25");
    record7.set("business_line", "L2-Formaci\u00f3n");
    record7.set("description", "Formaci\u00f3n online");
    record7.set("amount_dop", 6000);
    record7.set("participants", 10);
    record7.set("payment_method", "transferencia");
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