/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos");

  const existing = collection.fields.getByName("fecha_creacion");
  if (existing) {
    if (existing.type === "autodate") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("fecha_creacion"); // exists with wrong type, remove first
  }

  collection.fields.add(new AutodateField({
    name: "fecha_creacion",
    onCreate: true,
    onUpdate: false
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("productos");
  collection.fields.removeByName("fecha_creacion");
  return app.save(collection);
})