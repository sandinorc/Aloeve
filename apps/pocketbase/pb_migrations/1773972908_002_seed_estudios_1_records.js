/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("estudios");

  const record0 = new Record(collection);
    record0.set("nombre", "Aloeve Studio");
    record0.set("ubicacion", "Aloeve");
    record0.set("email", "admin@aloeve.com");
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