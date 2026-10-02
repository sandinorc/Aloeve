/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  // Fix: field is named 'rol', not 'role'. Also allow Admin to create users.
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id = id || @request.auth.rol = \"Admin\" || @request.auth.rol = \"Fundadora\"";
  collection.createRule = "@request.auth.rol = \"Admin\" || @request.auth.rol = \"Fundadora\"";
  collection.updateRule = "@request.auth.id = id || @request.auth.rol = \"Admin\" || @request.auth.rol = \"Fundadora\"";
  collection.deleteRule = "@request.auth.rol = \"Admin\" || @request.auth.rol = \"Fundadora\"";
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  collection.listRule = "@request.auth.id != \"\"";
  collection.viewRule = "@request.auth.id = id || @request.auth.role = \"Admin\" || @request.auth.role = \"Fundadora\"";
  collection.createRule = "@request.auth.role = \"Admin\" || @request.auth.role = \"Fundadora\"";
  collection.updateRule = "@request.auth.id = id || @request.auth.role = \"Admin\" || @request.auth.role = \"Fundadora\"";
  collection.deleteRule = "@request.auth.role = \"Admin\" || @request.auth.role = \"Fundadora\"";
  return app.save(collection);
})
