/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("incidents");

  const record0 = new Record(collection);
    record0.set("date", "2026-03-16");
    record0.set("description", "Stock bajo de lienzos - necesita reorden urgente");
    record0.set("severity", "alta");
    record0.set("status", "abierta");
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
    record1.set("date", "2026-03-14");
    record1.set("description", "Conflicto de horario en sesi\u00f3n del 18 de marzo");
    record1.set("severity", "media");
    record1.set("status", "abierta");
  try {
    app.save(record1);
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