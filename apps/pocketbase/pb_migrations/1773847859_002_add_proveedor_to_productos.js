/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos");

  const existing = collection.fields.getByName("proveedor");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("proveedor"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "proveedor"
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("productos");
  collection.fields.removeByName("proveedor");
  return app.save(collection);
})