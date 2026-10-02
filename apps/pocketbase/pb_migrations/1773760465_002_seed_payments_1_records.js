/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("payments");

  const record0 = new Record(collection);
    record0.set("date", "2026-03-15");
    record0.set("client_name", "Cliente X - Sesi\u00f3n privada");
    record0.set("amount_dop", 5000);
    record0.set("status", "pendiente");
    record0.set("due_date", "2026-03-15");
  try {
    app.save(record0);
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