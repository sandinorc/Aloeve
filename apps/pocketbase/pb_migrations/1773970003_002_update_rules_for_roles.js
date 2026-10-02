/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("roles");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  collection.createRule = "@request.auth.role = \"Admin\"";
  collection.updateRule = "@request.auth.role = \"Admin\"";
  collection.deleteRule = "@request.auth.role = \"Admin\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("roles");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id != \"\"";
  collection.createRule = "@request.auth.role = \"Admin\"";
  collection.updateRule = "@request.auth.role = \"Admin\"";
  collection.deleteRule = "@request.auth.role = \"Admin\"";
  return app.save(collection);
})