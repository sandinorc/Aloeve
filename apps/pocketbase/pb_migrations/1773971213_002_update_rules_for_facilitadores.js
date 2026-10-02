/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("facilitadores");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  collection.createRule = "@request.auth.id != \"\"";
  collection.updateRule = "@request.auth.id != \"\"";
  collection.deleteRule = "@request.auth.id != \"\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("facilitadores");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  collection.createRule = "@request.auth.role = 'Admin' || @request.auth.role = 'Fundadora' || @request.auth.role = 'StudioManager'";
  collection.updateRule = "@request.auth.role = 'Admin' || @request.auth.role = 'Fundadora' || (@request.auth.role = 'StudioManager' && studioId = @request.auth.studioId)";
  collection.deleteRule = "@request.auth.role = 'Admin' || @request.auth.role = 'Fundadora' || (@request.auth.role = 'StudioManager' && studioId = @request.auth.studioId)";
  return app.save(collection);
})