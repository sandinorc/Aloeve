/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos");

  const existing = collection.fields.getByName("sku");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("sku"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "sku",
    required: true
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("productos");
  collection.fields.removeByName("sku");
  return app.save(collection);
})