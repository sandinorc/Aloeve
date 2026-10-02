/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("reserva_caja");
  const field = collection.fields.getByName("saldo_actual");
  field.required = false;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("reserva_caja");
  const field = collection.fields.getByName("saldo_actual");
  field.required = true;
  return app.save(collection);
})