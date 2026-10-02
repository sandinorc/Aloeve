/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("suppliers");

  const record0 = new Record(collection);
    record0.set("name", "Distribuidora Art\u00edstica RD");
    record0.set("contact", "Tel: 809-555-0101, Email: ventas@artistica.do");
    record0.set("categories_provided", ["A", "C"]);
    record0.set("estimated_delivery_days", 2);
    record0.set("payment_method", "Transferencia");
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
    record1.set("name", "Mercado Central Santo Domingo");
    record1.set("contact", "Tel: 809-555-0202");
    record1.set("categories_provided", ["D", "E"]);
    record1.set("estimated_delivery_days", 1);
    record1.set("payment_method", "Efectivo");
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
    record2.set("name", "Proveedor Bebidas Premium");
    record2.set("contact", "Tel: 809-555-0303");
    record2.set("categories_provided", ["E"]);
    record2.set("estimated_delivery_days", 3);
    record2.set("payment_method", "Cr\u00e9dito");
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
    record3.set("name", "Tienda Materiales Finos");
    record3.set("contact", "Tel: 809-555-0404");
    record3.set("categories_provided", ["A", "B"]);
    record3.set("estimated_delivery_days", 2);
    record3.set("payment_method", "Transferencia");
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
    record4.set("name", "Distribuidor Limpieza");
    record4.set("contact", "Tel: 809-555-0505");
    record4.set("categories_provided", ["B", "C"]);
    record4.set("estimated_delivery_days", 1);
    record4.set("payment_method", "Efectivo");
  try {
    app.save(record4);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record5 = new Record(collection);
    record5.set("name", "Caf\u00e9 Importado RD");
    record5.set("contact", "Tel: 809-555-0606");
    record5.set("categories_provided", ["E"]);
    record5.set("estimated_delivery_days", 2);
    record5.set("payment_method", "Transferencia");
  try {
    app.save(record5);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record6 = new Record(collection);
    record6.set("name", "Empaques y Bolsas");
    record6.set("contact", "Tel: 809-555-0707");
    record6.set("categories_provided", ["D"]);
    record6.set("estimated_delivery_days", 1);
    record6.set("payment_method", "Efectivo");
  try {
    app.save(record6);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record7 = new Record(collection);
    record7.set("name", "Vinos Selectos Caribe");
    record7.set("contact", "Tel: 809-555-0808");
    record7.set("categories_provided", ["E"]);
    record7.set("estimated_delivery_days", 3);
    record7.set("payment_method", "Cr\u00e9dito");
  try {
    app.save(record7);
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