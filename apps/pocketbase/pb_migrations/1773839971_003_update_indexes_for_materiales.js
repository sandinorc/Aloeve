/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("materiales");
  collection.indexes.push("CREATE UNIQUE INDEX idx_materiales_codigo ON materiales (codigo)");
  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("materiales");
  collection.indexes = collection.indexes.filter(idx => !idx.includes("idx_materiales_codigo"));
  return app.save(collection);
})