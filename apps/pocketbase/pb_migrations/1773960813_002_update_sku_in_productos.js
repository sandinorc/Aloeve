/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos");
  const field = collection.fields.getByName("sku");
  field.required = false;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("productos");
  const field = collection.fields.getByName("sku");
  field.required = true;
  return app.save(collection);
})