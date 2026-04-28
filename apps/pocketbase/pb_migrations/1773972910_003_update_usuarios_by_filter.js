/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  let records;
  try {
    records = app.findRecordsByFilter("usuarios", "email='admin@aloeve.com'");
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("No records found, skipping");
      return;
    }
    throw e;
  }
  
  for (const record of records) {
    const record_studioIdLookup = app.findFirstRecordByFilter("estudios", "nombre='Aloeve Studio'");
    if (!record_studioIdLookup) { throw new Error("Lookup failed for studioId: no record in 'estudios' matching \"nombre='Aloeve Studio'\""); }
    record.set("studioId", record_studioIdLookup.id);
    try {
      app.save(record);
    } catch (e) {
      if (e.message.includes("Value must be unique")) {
        console.log("Record with unique value already exists, skipping");
      } else {
        throw e;
      }
    }
  }
}, (app) => {
  // Rollback: original values not stored, manual restore needed
})