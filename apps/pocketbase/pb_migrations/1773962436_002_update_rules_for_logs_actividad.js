/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("logs_actividad");
  collection.listRule = "@request.auth.role = \"Admin\" || @request.auth.role = \"Fundadora\"";
  collection.createRule = "@request.auth.id != \"\"";
  collection.deleteRule = "@request.auth.role = \"Admin\" || @request.auth.role = \"Fundadora\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("logs_actividad");
  collection.createRule = "@request.auth.id != ''";
  collection.listRule = "@request.auth.role = 'Fundadora'";
  collection.deleteRule = "@request.auth.role = 'Fundadora'";
  return app.save(collection);
})