/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  const record = new Record(collection);
  record.set("email", "sandinorc@gmail.com");
  record.setPassword("Sandino@2026Secure!");
  record.set("nombre_completo", "Sandino");
  record.set("rol", "Fundadora");
  record.set("estado", "Activo");
  try {
    return app.save(record);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
      return;
    }
    throw e;
  }
}, (app) => {
  try {
    const record = app.findFirstRecordByData("usuarios", "email", "sandinorc@gmail.com");
    app.delete(record);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Auth record not found, skipping rollback");
      return;
    }
    throw e;
  }
})