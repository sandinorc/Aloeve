/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("usuarios");

  const existing = collection.fields.getByName("studioId");
  if (existing) {
    if (existing.type === "text") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("studioId"); // exists with wrong type, remove first
  }

  collection.fields.add(new TextField({
    name: "studioId",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  collection.fields.removeByName("studioId");
  return app.save(collection);
})