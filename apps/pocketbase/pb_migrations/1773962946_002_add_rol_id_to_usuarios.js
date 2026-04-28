/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const rolesCollection = app.findCollectionByNameOrId("roles");
  const collection = app.findCollectionByNameOrId("usuarios");

  const existing = collection.fields.getByName("rol_id");
  if (existing) {
    if (existing.type === "relation") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("rol_id"); // exists with wrong type, remove first
  }

  collection.fields.add(new RelationField({
    name: "rol_id",
    required: false,
    collectionId: rolesCollection.id
  }));

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("usuarios");
  collection.fields.removeByName("rol_id");
  return app.save(collection);
})