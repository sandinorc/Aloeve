/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("usuarios");

  const existing = collection.fields.getByName("rol");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("rol"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "rol",
    required: true,
    values: ["Admin", "Fundadora", "StudioManager", "Facilitador", "Host"]
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  collection.fields.removeByName("rol");
  return app.save(collection);
})