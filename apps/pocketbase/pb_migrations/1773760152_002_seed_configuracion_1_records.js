/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("configuracion");

  const record0 = new Record(collection);
    record0.set("gastos_fijos_mensuales_dop", 17500);
    record0.set("tasa_usd_dop", 58.5);
    record0.set("meta_ocupacion_min", 30);
    record0.set("meta_ocupacion_max", 40);
    record0.set("meta_clientes_recurrentes_min", 15);
    record0.set("meta_clientes_recurrentes_max", 25);
    record0.set("reserva_minima_meses", 1);
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