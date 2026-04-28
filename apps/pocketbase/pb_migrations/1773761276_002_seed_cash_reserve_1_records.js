/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("cash_reserve");

  const record0 = new Record(collection);
    record0.set("monto_dop", 22000);
    record0.set("fecha_actualizacion", "2026-03-17");
    record0.set("user_id", "demo_user");
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