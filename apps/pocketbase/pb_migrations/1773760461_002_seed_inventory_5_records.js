/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("inventory");

  const record0 = new Record(collection);
    record0.set("item_name", "Lienzos 50x70cm");
    record0.set("category", "Materiales");
    record0.set("current_stock", 8);
    record0.set("minimum_stock", 15);
    record0.set("unit_price_dop", 450);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("item_name", "Pinturas acr\u00edlicas base");
    record1.set("category", "Materiales");
    record1.set("current_stock", 5);
    record1.set("minimum_stock", 10);
    record1.set("unit_price_dop", 280);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("item_name", "Pinceles profesionales");
    record2.set("category", "Materiales");
    record2.set("current_stock", 12);
    record2.set("minimum_stock", 20);
    record2.set("unit_price_dop", 150);
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record3 = new Record(collection);
    record3.set("item_name", "Papel de arte");
    record3.set("category", "Materiales");
    record3.set("current_stock", 20);
    record3.set("minimum_stock", 30);
    record3.set("unit_price_dop", 80);
  try {
    app.save(record3);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record4 = new Record(collection);
    record4.set("item_name", "Marcos decorativos");
    record4.set("category", "Productos");
    record4.set("current_stock", 3);
    record4.set("minimum_stock", 5);
    record4.set("unit_price_dop", 600);
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})