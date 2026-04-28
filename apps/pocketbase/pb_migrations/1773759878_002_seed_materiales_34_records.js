/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("materiales");

  const record0 = new Record(collection);
    record0.set("nombre", "Lienzo 20x20");
    record0.set("categoria", "Artisticos_base");
    record0.set("unidad_medida", "unidad");
    record0.set("stock_actual", 50);
    record0.set("nivel_minimo", 10);
    record0.set("precio_unitario_dop", 150);
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
    record1.set("nombre", "Lienzo 30x40");
    record1.set("categoria", "Artisticos_base");
    record1.set("unidad_medida", "unidad");
    record1.set("stock_actual", 35);
    record1.set("nivel_minimo", 8);
    record1.set("precio_unitario_dop", 250);
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
    record2.set("nombre", "Lienzo 40x50");
    record2.set("categoria", "Artisticos_base");
    record2.set("unidad_medida", "unidad");
    record2.set("stock_actual", 25);
    record2.set("nivel_minimo", 5);
    record2.set("precio_unitario_dop", 350);
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
    record3.set("nombre", "Lienzo 60x80");
    record3.set("categoria", "Artisticos_base");
    record3.set("unidad_medida", "unidad");
    record3.set("stock_actual", 15);
    record3.set("nivel_minimo", 3);
    record3.set("precio_unitario_dop", 500);
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
    record4.set("nombre", "Pintura Acr\u00edlica Blanco");
    record4.set("categoria", "Artisticos_base");
    record4.set("unidad_medida", "ml");
    record4.set("stock_actual", 2000);
    record4.set("nivel_minimo", 500);
    record4.set("precio_unitario_dop", 8);
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
    record5.set("nombre", "Pintura Acr\u00edlica Negro");
    record5.set("categoria", "Artisticos_base");
    record5.set("unidad_medida", "ml");
    record5.set("stock_actual", 1800);
    record5.set("nivel_minimo", 500);
    record5.set("precio_unitario_dop", 8);
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
    record6.set("nombre", "Pintura Acr\u00edlica Rojo");
    record6.set("categoria", "Artisticos_base");
    record6.set("unidad_medida", "ml");
    record6.set("stock_actual", 1500);
    record6.set("nivel_minimo", 400);
    record6.set("precio_unitario_dop", 10);
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
    record7.set("nombre", "Pintura Acr\u00edlica Amarillo");
    record7.set("categoria", "Artisticos_base");
    record7.set("unidad_medida", "ml");
    record7.set("stock_actual", 1600);
    record7.set("nivel_minimo", 400);
    record7.set("precio_unitario_dop", 10);
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
    record8.set("nombre", "Pintura Acr\u00edlica Azul");
    record8.set("categoria", "Artisticos_base");
    record8.set("unidad_medida", "ml");
    record8.set("stock_actual", 1700);
    record8.set("nivel_minimo", 400);
    record8.set("precio_unitario_dop", 10);
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
    record9.set("nombre", "Pintura Acr\u00edlica Verde");
    record9.set("categoria", "Artisticos_base");
    record9.set("unidad_medida", "ml");
    record9.set("stock_actual", 1400);
    record9.set("nivel_minimo", 400);
    record9.set("precio_unitario_dop", 10);
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
    record10.set("nombre", "Pintura Acr\u00edlica Naranja");
    record10.set("categoria", "Artisticos_base");
    record10.set("unidad_medida", "ml");
    record10.set("stock_actual", 1200);
    record10.set("nivel_minimo", 300);
    record10.set("precio_unitario_dop", 10);
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
    record11.set("nombre", "Pintura Acr\u00edlica Violeta");
    record11.set("categoria", "Artisticos_base");
    record11.set("unidad_medida", "ml");
    record11.set("stock_actual", 1100);
    record11.set("nivel_minimo", 300);
    record11.set("precio_unitario_dop", 10);
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
    record12.set("nombre", "Pintura Acr\u00edlica Ocre");
    record12.set("categoria", "Artisticos_base");
    record12.set("unidad_medida", "ml");
    record12.set("stock_actual", 900);
    record12.set("nivel_minimo", 250);
    record12.set("precio_unitario_dop", 10);
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
    record13.set("nombre", "Pincel Fino");
    record13.set("categoria", "Artisticos_base");
    record13.set("unidad_medida", "unidad");
    record13.set("stock_actual", 80);
    record13.set("nivel_minimo", 20);
    record13.set("precio_unitario_dop", 45);
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
    record14.set("nombre", "Pincel Mediano");
    record14.set("categoria", "Artisticos_base");
    record14.set("unidad_medida", "unidad");
    record14.set("stock_actual", 100);
    record14.set("nivel_minimo", 25);
    record14.set("precio_unitario_dop", 55);
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
    record15.set("nombre", "Pincel Grueso");
    record15.set("categoria", "Artisticos_base");
    record15.set("unidad_medida", "unidad");
    record15.set("stock_actual", 70);
    record15.set("nivel_minimo", 15);
    record15.set("precio_unitario_dop", 65);
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
    record16.set("nombre", "Pincel Plano");
    record16.set("categoria", "Artisticos_base");
    record16.set("unidad_medida", "unidad");
    record16.set("stock_actual", 60);
    record16.set("nivel_minimo", 15);
    record16.set("precio_unitario_dop", 50);
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
    record17.set("nombre", "Paleta");
    record17.set("categoria", "Artisticos_base");
    record17.set("unidad_medida", "unidad");
    record17.set("stock_actual", 40);
    record17.set("nivel_minimo", 10);
    record17.set("precio_unitario_dop", 75);
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
    record18.set("nombre", "Carboncillo");
    record18.set("categoria", "Artisticos_base");
    record18.set("unidad_medida", "unidad");
    record18.set("stock_actual", 120);
    record18.set("nivel_minimo", 30);
    record18.set("precio_unitario_dop", 25);
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
    record19.set("nombre", "Caballete");
    record19.set("categoria", "Apoyo_proteccion");
    record19.set("unidad_medida", "unidad");
    record19.set("stock_actual", 20);
    record19.set("nivel_minimo", 5);
    record19.set("precio_unitario_dop", 300);
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
    record20.set("nombre", "Libreta");
    record20.set("categoria", "Consumibles_experiencia");
    record20.set("unidad_medida", "unidad");
    record20.set("stock_actual", 150);
    record20.set("nivel_minimo", 30);
    record20.set("precio_unitario_dop", 35);
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
    record21.set("nombre", "Delantal");
    record21.set("categoria", "Apoyo_proteccion");
    record21.set("unidad_medida", "unidad");
    record21.set("stock_actual", 60);
    record21.set("nivel_minimo", 15);
    record21.set("precio_unitario_dop", 80);
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
    record22.set("nombre", "Mantel");
    record22.set("categoria", "Limpieza_artistica");
    record22.set("unidad_medida", "unidad");
    record22.set("stock_actual", 30);
    record22.set("nivel_minimo", 10);
    record22.set("precio_unitario_dop", 120);
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
    record23.set("nombre", "Toalla Papel");
    record23.set("categoria", "Limpieza_artistica");
    record23.set("unidad_medida", "unidad");
    record23.set("stock_actual", 200);
    record23.set("nivel_minimo", 50);
    record23.set("precio_unitario_dop", 15);
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
    record24.set("nombre", "Guantes");
    record24.set("categoria", "Apoyo_proteccion");
    record24.set("unidad_medida", "unidad");
    record24.set("stock_actual", 500);
    record24.set("nivel_minimo", 100);
    record24.set("precio_unitario_dop", 5);
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
    record25.set("nombre", "Vaso");
    record25.set("categoria", "Bebidas_cafe");
    record25.set("unidad_medida", "unidad");
    record25.set("stock_actual", 300);
    record25.set("nivel_minimo", 50);
    record25.set("precio_unitario_dop", 8);
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
    record26.set("nombre", "Servilleta");
    record26.set("categoria", "Bebidas_cafe");
    record26.set("unidad_medida", "unidad");
    record26.set("stock_actual", 1000);
    record26.set("nivel_minimo", 200);
    record26.set("precio_unitario_dop", 2);
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
    record27.set("nombre", "Caf\u00e9");
    record27.set("categoria", "Bebidas_cafe");
    record27.set("unidad_medida", "gramos");
    record27.set("stock_actual", 5000);
    record27.set("nivel_minimo", 1000);
    record27.set("precio_unitario_dop", 0.5);
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
    record28.set("nombre", "Vino Tinto");
    record28.set("categoria", "Bebidas_cafe");
    record28.set("unidad_medida", "litros");
    record28.set("stock_actual", 50);
    record28.set("nivel_minimo", 10);
    record28.set("precio_unitario_dop", 200);
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
    record29.set("nombre", "Vino Blanco");
    record29.set("categoria", "Bebidas_cafe");
    record29.set("unidad_medida", "litros");
    record29.set("stock_actual", 40);
    record29.set("nivel_minimo", 8);
    record29.set("precio_unitario_dop", 180);
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
    record30.set("nombre", "Jugo");
    record30.set("categoria", "Bebidas_cafe");
    record30.set("unidad_medida", "litros");
    record30.set("stock_actual", 30);
    record30.set("nivel_minimo", 5);
    record30.set("precio_unitario_dop", 80);
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
    record31.set("nombre", "Agua");
    record31.set("categoria", "Bebidas_cafe");
    record31.set("unidad_medida", "litros");
    record31.set("stock_actual", 100);
    record31.set("nivel_minimo", 20);
    record31.set("precio_unitario_dop", 20);
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
    record32.set("nombre", "Hielo");
    record32.set("categoria", "Bebidas_cafe");
    record32.set("unidad_medida", "kg");
    record32.set("stock_actual", 25);
    record32.set("nivel_minimo", 5);
    record32.set("precio_unitario_dop", 50);
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
    record33.set("nombre", "Copa");
    record33.set("categoria", "Bebidas_cafe");
    record33.set("unidad_medida", "unidad");
    record33.set("stock_actual", 200);
    record33.set("nivel_minimo", 40);
    record33.set("precio_unitario_dop", 25);
  try {
    app.save(record33);
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