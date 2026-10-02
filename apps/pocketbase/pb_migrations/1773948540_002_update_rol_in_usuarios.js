/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  const field = collection.fields.getByName("rol");
  field.values = ["Admin", "Fundadora", "StudioManager", "Facilitador", "Host", "User"];
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  const field = collection.fields.getByName("rol");
  field.values = ["Admin", "Fundadora", "StudioManager", "Facilitador", "Host"];
  return app.save(collection);
})