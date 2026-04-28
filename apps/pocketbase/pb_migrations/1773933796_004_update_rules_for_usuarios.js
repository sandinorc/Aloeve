/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  collection.createRule = "@request.auth.role = 'Fundadora'";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  collection.createRule = "null";
  return app.save(collection);
})