/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("roles");
  collection.indexes.push("CREATE UNIQUE INDEX idx_roles_nombre ON roles (nombre)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("roles");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_roles_nombre"));
  return app.save(collection);
})