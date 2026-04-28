/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id = id || @request.auth.role = 'Admin' || @request.auth.role = 'Fundadora'";
  collection.updateRule = "@request.auth.id = id || @request.auth.role = 'Admin' || @request.auth.role = 'Fundadora'";
  collection.deleteRule = "@request.auth.role = 'Admin' || @request.auth.role = 'Fundadora'";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  collection.listRule = "@request.auth.role = 'Fundadora'";
  collection.viewRule = "@request.auth.role = 'Fundadora'";
  collection.updateRule = "@request.auth.role = 'Fundadora'";
  collection.deleteRule = "@request.auth.role = 'Fundadora'";
  return app.save(collection);
})