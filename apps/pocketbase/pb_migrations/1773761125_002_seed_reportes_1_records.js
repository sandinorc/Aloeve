/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("reportes");

  const record0 = new Record(collection);
    record0.set("tipo", "Mensual");
    record0.set("periodo", "Marzo 2026");
    record0.set("ingresos_total", 48200);
    record0.set("gastos_total", 30400);
    record0.set("margen", 17800);
    record0.set("fecha_creacion", "2026-03-31");
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