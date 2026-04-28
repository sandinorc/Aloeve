/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos");
  const field = collection.fields.getByName("precio_base");
  field.required = true;
  field.min = 0;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("productos");
  const field = collection.fields.getByName("precio_base");
  field.required = true;
  field.min = 0;
  return app.save(collection);
})