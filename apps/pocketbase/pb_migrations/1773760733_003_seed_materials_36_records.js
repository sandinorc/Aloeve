/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("materials");

  const record0 = new Record(collection);
    record0.set("name", "Lienzos 20x20");
    record0.set("category", "A-Art\u00edsticos base");
    record0.set("unit_of_measure", "unidad");
    record0.set("current_stock", 25);
    record0.set("minimum_stock", 20);
    record0.set("unit_price_dop", 150);
    const record0_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record0_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record0.set("supplier_id", record0_supplier_idLookup.id);
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
    record1.set("name", "Lienzos 30x40");
    record1.set("category", "A-Art\u00edsticos base");
    record1.set("unit_of_measure", "unidad");
    record1.set("current_stock", 4);
    record1.set("minimum_stock", 10);
    record1.set("unit_price_dop", 280);
    const record1_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record1_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record1.set("supplier_id", record1_supplier_idLookup.id);
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
    record2.set("name", "Lienzos 40x50");
    record2.set("category", "A-Art\u00edsticos base");
    record2.set("unit_of_measure", "unidad");
    record2.set("current_stock", 8);
    record2.set("minimum_stock", 12);
    record2.set("unit_price_dop", 380);
    const record2_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record2_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record2.set("supplier_id", record2_supplier_idLookup.id);
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
    record3.set("name", "Lienzos 60x80");
    record3.set("category", "A-Art\u00edsticos base");
    record3.set("unit_of_measure", "unidad");
    record3.set("current_stock", 2);
    record3.set("minimum_stock", 5);
    record3.set("unit_price_dop", 650);
    const record3_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record3_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record3.set("supplier_id", record3_supplier_idLookup.id);
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
    record4.set("name", "Pintura acr\u00edlica blanco");
    record4.set("category", "A-Art\u00edsticos base");
    record4.set("unit_of_measure", "unidad");
    record4.set("current_stock", 8);
    record4.set("minimum_stock", 10);
    record4.set("unit_price_dop", 120);
    const record4_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record4_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record4.set("supplier_id", record4_supplier_idLookup.id);
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
    record5.set("name", "Pintura acr\u00edlica negro");
    record5.set("category", "A-Art\u00edsticos base");
    record5.set("unit_of_measure", "unidad");
    record5.set("current_stock", 6);
    record5.set("minimum_stock", 10);
    record5.set("unit_price_dop", 120);
    const record5_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record5_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record5.set("supplier_id", record5_supplier_idLookup.id);
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
    record6.set("name", "Pintura acr\u00edlica rojo");
    record6.set("category", "A-Art\u00edsticos base");
    record6.set("unit_of_measure", "unidad");
    record6.set("current_stock", 2);
    record6.set("minimum_stock", 8);
    record6.set("unit_price_dop", 140);
    const record6_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record6_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record6.set("supplier_id", record6_supplier_idLookup.id);
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
    record7.set("name", "Pintura acr\u00edlica amarillo");
    record7.set("category", "A-Art\u00edsticos base");
    record7.set("unit_of_measure", "unidad");
    record7.set("current_stock", 5);
    record7.set("minimum_stock", 8);
    record7.set("unit_price_dop", 140);
    const record7_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record7_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record7.set("supplier_id", record7_supplier_idLookup.id);
  try {
    app.save(record7);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record8 = new Record(collection);
    record8.set("name", "Pintura acr\u00edlica azul");
    record8.set("category", "A-Art\u00edsticos base");
    record8.set("unit_of_measure", "unidad");
    record8.set("current_stock", 7);
    record8.set("minimum_stock", 10);
    record8.set("unit_price_dop", 140);
    const record8_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record8_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record8.set("supplier_id", record8_supplier_idLookup.id);
  try {
    app.save(record8);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record9 = new Record(collection);
    record9.set("name", "Pinceles finos");
    record9.set("category", "A-Art\u00edsticos base");
    record9.set("unit_of_measure", "unidad");
    record9.set("current_stock", 3);
    record9.set("minimum_stock", 15);
    record9.set("unit_price_dop", 85);
    const record9_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Tienda Materiales Finos'");
    if (!record9_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Tienda Materiales Finos'\""); }
    record9.set("supplier_id", record9_supplier_idLookup.id);
  try {
    app.save(record9);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record10 = new Record(collection);
    record10.set("name", "Pinceles medianos");
    record10.set("category", "A-Art\u00edsticos base");
    record10.set("unit_of_measure", "unidad");
    record10.set("current_stock", 12);
    record10.set("minimum_stock", 15);
    record10.set("unit_price_dop", 95);
    const record10_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Tienda Materiales Finos'");
    if (!record10_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Tienda Materiales Finos'\""); }
    record10.set("supplier_id", record10_supplier_idLookup.id);
  try {
    app.save(record10);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record11 = new Record(collection);
    record11.set("name", "Pinceles gruesos");
    record11.set("category", "A-Art\u00edsticos base");
    record11.set("unit_of_measure", "unidad");
    record11.set("current_stock", 10);
    record11.set("minimum_stock", 12);
    record11.set("unit_price_dop", 110);
    const record11_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Tienda Materiales Finos'");
    if (!record11_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Tienda Materiales Finos'\""); }
    record11.set("supplier_id", record11_supplier_idLookup.id);
  try {
    app.save(record11);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record12 = new Record(collection);
    record12.set("name", "Delantales");
    record12.set("category", "B-Apoyo y protecci\u00f3n");
    record12.set("unit_of_measure", "unidad");
    record12.set("current_stock", 18);
    record12.set("minimum_stock", 20);
    record12.set("unit_price_dop", 45);
    const record12_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Tienda Materiales Finos'");
    if (!record12_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Tienda Materiales Finos'\""); }
    record12.set("supplier_id", record12_supplier_idLookup.id);
  try {
    app.save(record12);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record13 = new Record(collection);
    record13.set("name", "Manteles protectores");
    record13.set("category", "B-Apoyo y protecci\u00f3n");
    record13.set("unit_of_measure", "unidad");
    record13.set("current_stock", 12);
    record13.set("minimum_stock", 15);
    record13.set("unit_price_dop", 80);
    const record13_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidor Limpieza'");
    if (!record13_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidor Limpieza'\""); }
    record13.set("supplier_id", record13_supplier_idLookup.id);
  try {
    app.save(record13);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record14 = new Record(collection);
    record14.set("name", "Toallas papel");
    record14.set("category", "B-Apoyo y protecci\u00f3n");
    record14.set("unit_of_measure", "unidad");
    record14.set("current_stock", 8);
    record14.set("minimum_stock", 10);
    record14.set("unit_price_dop", 35);
    const record14_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidor Limpieza'");
    if (!record14_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidor Limpieza'\""); }
    record14.set("supplier_id", record14_supplier_idLookup.id);
  try {
    app.save(record14);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record15 = new Record(collection);
    record15.set("name", "Guantes desechables");
    record15.set("category", "B-Apoyo y protecci\u00f3n");
    record15.set("unit_of_measure", "pares");
    record15.set("current_stock", 3);
    record15.set("minimum_stock", 5);
    record15.set("unit_price_dop", 25);
    const record15_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidor Limpieza'");
    if (!record15_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidor Limpieza'\""); }
    record15.set("supplier_id", record15_supplier_idLookup.id);
  try {
    app.save(record15);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record16 = new Record(collection);
    record16.set("name", "Bolsas desechos");
    record16.set("category", "B-Apoyo y protecci\u00f3n");
    record16.set("unit_of_measure", "unidad");
    record16.set("current_stock", 25);
    record16.set("minimum_stock", 30);
    record16.set("unit_price_dop", 15);
    const record16_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidor Limpieza'");
    if (!record16_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidor Limpieza'\""); }
    record16.set("supplier_id", record16_supplier_idLookup.id);
  try {
    app.save(record16);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record17 = new Record(collection);
    record17.set("name", "Vasos/recipientes agua");
    record17.set("category", "C-Limpieza art\u00edstica");
    record17.set("unit_of_measure", "unidad");
    record17.set("current_stock", 20);
    record17.set("minimum_stock", 25);
    record17.set("unit_price_dop", 30);
    const record17_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidora Artística RD'");
    if (!record17_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidora Artística RD'\""); }
    record17.set("supplier_id", record17_supplier_idLookup.id);
  try {
    app.save(record17);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record18 = new Record(collection);
    record18.set("name", "Jab\u00f3n pinceles");
    record18.set("category", "C-Limpieza art\u00edstica");
    record18.set("unit_of_measure", "unidad");
    record18.set("current_stock", 4);
    record18.set("minimum_stock", 6);
    record18.set("unit_price_dop", 95);
    const record18_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidor Limpieza'");
    if (!record18_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidor Limpieza'\""); }
    record18.set("supplier_id", record18_supplier_idLookup.id);
  try {
    app.save(record18);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record19 = new Record(collection);
    record19.set("name", "Esponjas");
    record19.set("category", "C-Limpieza art\u00edstica");
    record19.set("unit_of_measure", "unidad");
    record19.set("current_stock", 6);
    record19.set("minimum_stock", 8);
    record19.set("unit_price_dop", 45);
    const record19_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidor Limpieza'");
    if (!record19_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidor Limpieza'\""); }
    record19.set("supplier_id", record19_supplier_idLookup.id);
  try {
    app.save(record19);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record20 = new Record(collection);
    record20.set("name", "Alcohol");
    record20.set("category", "C-Limpieza art\u00edstica");
    record20.set("unit_of_measure", "litro");
    record20.set("current_stock", 2);
    record20.set("minimum_stock", 3);
    record20.set("unit_price_dop", 180);
    const record20_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidor Limpieza'");
    if (!record20_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidor Limpieza'\""); }
    record20.set("supplier_id", record20_supplier_idLookup.id);
  try {
    app.save(record20);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record21 = new Record(collection);
    record21.set("name", "Trapos reutilizables");
    record21.set("category", "C-Limpieza art\u00edstica");
    record21.set("unit_of_measure", "unidad");
    record21.set("current_stock", 15);
    record21.set("minimum_stock", 20);
    record21.set("unit_price_dop", 25);
    const record21_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Distribuidor Limpieza'");
    if (!record21_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Distribuidor Limpieza'\""); }
    record21.set("supplier_id", record21_supplier_idLookup.id);
  try {
    app.save(record21);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record22 = new Record(collection);
    record22.set("name", "Vasos desechables");
    record22.set("category", "D-Consumibles experiencia");
    record22.set("unit_of_measure", "unidad");
    record22.set("current_stock", 150);
    record22.set("minimum_stock", 200);
    record22.set("unit_price_dop", 8);
    const record22_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Mercado Central Santo Domingo'");
    if (!record22_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Mercado Central Santo Domingo'\""); }
    record22.set("supplier_id", record22_supplier_idLookup.id);
  try {
    app.save(record22);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record23 = new Record(collection);
    record23.set("name", "Servilletas");
    record23.set("category", "D-Consumibles experiencia");
    record23.set("unit_of_measure", "unidad");
    record23.set("current_stock", 80);
    record23.set("minimum_stock", 100);
    record23.set("unit_price_dop", 12);
    const record23_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Mercado Central Santo Domingo'");
    if (!record23_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Mercado Central Santo Domingo'\""); }
    record23.set("supplier_id", record23_supplier_idLookup.id);
  try {
    app.save(record23);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record24 = new Record(collection);
    record24.set("name", "Az\u00facar/sobres");
    record24.set("category", "D-Consumibles experiencia");
    record24.set("unit_of_measure", "unidad");
    record24.set("current_stock", 25);
    record24.set("minimum_stock", 30);
    record24.set("unit_price_dop", 5);
    const record24_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Mercado Central Santo Domingo'");
    if (!record24_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Mercado Central Santo Domingo'\""); }
    record24.set("supplier_id", record24_supplier_idLookup.id);
  try {
    app.save(record24);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record25 = new Record(collection);
    record25.set("name", "Etiquetas/stickers");
    record25.set("category", "D-Consumibles experiencia");
    record25.set("unit_of_measure", "unidad");
    record25.set("current_stock", 200);
    record25.set("minimum_stock", 250);
    record25.set("unit_price_dop", 2);
    const record25_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Empaques y Bolsas'");
    if (!record25_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Empaques y Bolsas'\""); }
    record25.set("supplier_id", record25_supplier_idLookup.id);
  try {
    app.save(record25);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record26 = new Record(collection);
    record26.set("name", "Fundas empaque");
    record26.set("category", "D-Consumibles experiencia");
    record26.set("unit_of_measure", "unidad");
    record26.set("current_stock", 100);
    record26.set("minimum_stock", 150);
    record26.set("unit_price_dop", 3);
    const record26_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Empaques y Bolsas'");
    if (!record26_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Empaques y Bolsas'\""); }
    record26.set("supplier_id", record26_supplier_idLookup.id);
  try {
    app.save(record26);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record27 = new Record(collection);
    record27.set("name", "Cart\u00f3n");
    record27.set("category", "D-Consumibles experiencia");
    record27.set("unit_of_measure", "unidad");
    record27.set("current_stock", 20);
    record27.set("minimum_stock", 30);
    record27.set("unit_price_dop", 45);
    const record27_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Empaques y Bolsas'");
    if (!record27_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Empaques y Bolsas'\""); }
    record27.set("supplier_id", record27_supplier_idLookup.id);
  try {
    app.save(record27);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record28 = new Record(collection);
    record28.set("name", "Cinta");
    record28.set("category", "D-Consumibles experiencia");
    record28.set("unit_of_measure", "unidad");
    record28.set("current_stock", 5);
    record28.set("minimum_stock", 8);
    record28.set("unit_price_dop", 25);
    const record28_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Empaques y Bolsas'");
    if (!record28_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Empaques y Bolsas'\""); }
    record28.set("supplier_id", record28_supplier_idLookup.id);
  try {
    app.save(record28);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record29 = new Record(collection);
    record29.set("name", "Bolsas");
    record29.set("category", "D-Consumibles experiencia");
    record29.set("unit_of_measure", "unidad");
    record29.set("current_stock", 50);
    record29.set("minimum_stock", 75);
    record29.set("unit_price_dop", 4);
    const record29_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Empaques y Bolsas'");
    if (!record29_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Empaques y Bolsas'\""); }
    record29.set("supplier_id", record29_supplier_idLookup.id);
  try {
    app.save(record29);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record30 = new Record(collection);
    record30.set("name", "Caf\u00e9");
    record30.set("category", "E-Bebidas y caf\u00e9");
    record30.set("unit_of_measure", "gramos");
    record30.set("current_stock", 800);
    record30.set("minimum_stock", 1000);
    record30.set("unit_price_dop", 280);
    const record30_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Café Importado RD'");
    if (!record30_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Café Importado RD'\""); }
    record30.set("supplier_id", record30_supplier_idLookup.id);
  try {
    app.save(record30);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record31 = new Record(collection);
    record31.set("name", "Vino tinto");
    record31.set("category", "E-Bebidas y caf\u00e9");
    record31.set("unit_of_measure", "botellas");
    record31.set("current_stock", 2);
    record31.set("minimum_stock", 4);
    record31.set("unit_price_dop", 450);
    const record31_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Vinos Selectos Caribe'");
    if (!record31_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Vinos Selectos Caribe'\""); }
    record31.set("supplier_id", record31_supplier_idLookup.id);
  try {
    app.save(record31);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record32 = new Record(collection);
    record32.set("name", "Vino blanco");
    record32.set("category", "E-Bebidas y caf\u00e9");
    record32.set("unit_of_measure", "botellas");
    record32.set("current_stock", 3);
    record32.set("minimum_stock", 4);
    record32.set("unit_price_dop", 420);
    const record32_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Vinos Selectos Caribe'");
    if (!record32_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Vinos Selectos Caribe'\""); }
    record32.set("supplier_id", record32_supplier_idLookup.id);
  try {
    app.save(record32);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record33 = new Record(collection);
    record33.set("name", "Jugos");
    record33.set("category", "E-Bebidas y caf\u00e9");
    record33.set("unit_of_measure", "botellas");
    record33.set("current_stock", 6);
    record33.set("minimum_stock", 8);
    record33.set("unit_price_dop", 95);
    const record33_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Mercado Central Santo Domingo'");
    if (!record33_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Mercado Central Santo Domingo'\""); }
    record33.set("supplier_id", record33_supplier_idLookup.id);
  try {
    app.save(record33);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record34 = new Record(collection);
    record34.set("name", "Agua");
    record34.set("category", "E-Bebidas y caf\u00e9");
    record34.set("unit_of_measure", "botellas");
    record34.set("current_stock", 24);
    record34.set("minimum_stock", 30);
    record34.set("unit_price_dop", 35);
    const record34_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Mercado Central Santo Domingo'");
    if (!record34_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Mercado Central Santo Domingo'\""); }
    record34.set("supplier_id", record34_supplier_idLookup.id);
  try {
    app.save(record34);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record35 = new Record(collection);
    record35.set("name", "Hielo");
    record35.set("category", "E-Bebidas y caf\u00e9");
    record35.set("unit_of_measure", "kg");
    record35.set("current_stock", 5);
    record35.set("minimum_stock", 10);
    record35.set("unit_price_dop", 40);
    const record35_supplier_idLookup = app.findFirstRecordByFilter("suppliers", "name='Mercado Central Santo Domingo'");
    if (!record35_supplier_idLookup) { throw new Error("Lookup failed for supplier_id: no record in 'suppliers' matching \"name='Mercado Central Santo Domingo'\""); }
    record35.set("supplier_id", record35_supplier_idLookup.id);
  try {
    app.save(record35);
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