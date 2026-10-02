/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("productos");

  const record0 = new Record(collection);
    record0.set("nombre", "Vino Tinto Premium");
    record0.set("descripcion", "Vino tinto de alta calidad con notas de frutas rojas");
    record0.set("categoria", "Vinos");
    record0.set("precio_base", 1500);
    record0.set("itbis", 18);
    record0.set("stock", 75);
    record0.set("imagen_url", "https://via.placeholder.com/300x300?text=Vino+Tinto+Premium");
    record0.set("estado", "Activo");
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
    record1.set("nombre", "Vino Blanco Crianza");
    record1.set("descripcion", "Vino blanco criado en barrica con sabor equilibrado");
    record1.set("categoria", "Vinos");
    record1.set("precio_base", 1200);
    record1.set("itbis", 18);
    record1.set("stock", 60);
    record1.set("imagen_url", "https://via.placeholder.com/300x300?text=Vino+Blanco+Crianza");
    record1.set("estado", "Activo");
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
    record2.set("nombre", "Vino Rosado Fresco");
    record2.set("descripcion", "Vino rosado ligero y refrescante para cualquier ocasi\u00f3n");
    record2.set("categoria", "Vinos");
    record2.set("precio_base", 800);
    record2.set("itbis", 18);
    record2.set("stock", 100);
    record2.set("imagen_url", "https://via.placeholder.com/300x300?text=Vino+Rosado+Fresco");
    record2.set("estado", "Activo");
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
    record3.set("nombre", "Caf\u00e9 Premium Molido");
    record3.set("descripcion", "Caf\u00e9 molido de grano seleccionado, aroma intenso");
    record3.set("categoria", "Caf\u00e9");
    record3.set("precio_base", 600);
    record3.set("itbis", 18);
    record3.set("stock", 150);
    record3.set("imagen_url", "https://via.placeholder.com/300x300?text=Cafe+Premium+Molido");
    record3.set("estado", "Activo");
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
    record4.set("nombre", "Caf\u00e9 Regular Grano");
    record4.set("descripcion", "Caf\u00e9 en grano de calidad regular para uso diario");
    record4.set("categoria", "Caf\u00e9");
    record4.set("precio_base", 400);
    record4.set("itbis", 18);
    record4.set("stock", 120);
    record4.set("imagen_url", "https://via.placeholder.com/300x300?text=Cafe+Regular+Grano");
    record4.set("estado", "Activo");
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
    record5.set("nombre", "Caf\u00e9 Espresso Blend");
    record5.set("descripcion", "Mezcla especial para espresso con cuerpo y crema");
    record5.set("categoria", "Caf\u00e9");
    record5.set("precio_base", 500);
    record5.set("itbis", 18);
    record5.set("stock", 90);
    record5.set("imagen_url", "https://via.placeholder.com/300x300?text=Cafe+Espresso+Blend");
    record5.set("estado", "Activo");
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
    record6.set("nombre", "Pintura Acr\u00edlica Premium");
    record6.set("descripcion", "Pintura acr\u00edlica de alta calidad para lienzo");
    record6.set("categoria", "Pinturas");
    record6.set("precio_base", 800);
    record6.set("itbis", 18);
    record6.set("stock", 80);
    record6.set("imagen_url", "https://via.placeholder.com/300x300?text=Pintura+Acrilica+Premium");
    record6.set("estado", "Activo");
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
    record7.set("nombre", "Pintura \u00d3leo Profesional");
    record7.set("descripcion", "Pintura al \u00f3leo profesional con pigmentos puros");
    record7.set("categoria", "Pinturas");
    record7.set("precio_base", 1000);
    record7.set("itbis", 18);
    record7.set("stock", 50);
    record7.set("imagen_url", "https://via.placeholder.com/300x300?text=Pintura+Oleo+Profesional");
    record7.set("estado", "Activo");
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
    record8.set("nombre", "Pintura Acuarela Set");
    record8.set("descripcion", "Set completo de acuarelas para artistas");
    record8.set("categoria", "Pinturas");
    record8.set("precio_base", 600);
    record8.set("itbis", 18);
    record8.set("stock", 70);
    record8.set("imagen_url", "https://via.placeholder.com/300x300?text=Pintura+Acuarela+Set");
    record8.set("estado", "Activo");
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
    record9.set("nombre", "Lienzo 50x70cm");
    record9.set("descripcion", "Lienzo de algod\u00f3n puro 50x70cm listo para pintar");
    record9.set("categoria", "Materiales");
    record9.set("precio_base", 400);
    record9.set("itbis", 18);
    record9.set("stock", 100);
    record9.set("imagen_url", "https://via.placeholder.com/300x300?text=Lienzo+50x70cm");
    record9.set("estado", "Activo");
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
    record10.set("nombre", "Pinceles Set Profesional");
    record10.set("descripcion", "Set de 12 pinceles profesionales de diferentes tama\u00f1os");
    record10.set("categoria", "Materiales");
    record10.set("precio_base", 300);
    record10.set("itbis", 18);
    record10.set("stock", 120);
    record10.set("imagen_url", "https://via.placeholder.com/300x300?text=Pinceles+Set+Profesional");
    record10.set("estado", "Activo");
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
    record11.set("nombre", "Papel Especial Art\u00edstico");
    record11.set("descripcion", "Papel de alta calidad para trabajos art\u00edsticos");
    record11.set("categoria", "Materiales");
    record11.set("precio_base", 200);
    record11.set("itbis", 18);
    record11.set("stock", 150);
    record11.set("imagen_url", "https://via.placeholder.com/300x300?text=Papel+Especial+Artistico");
    record11.set("estado", "Activo");
  try {
    app.save(record11);
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