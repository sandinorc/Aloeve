/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos");
  const field = collection.fields.getByName("stock_minimo");
  field.required = false;
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("productos");
  const field = collection.fields.getByName("stock_minimo");
  field.required = true;
  return app.save(collection);
})