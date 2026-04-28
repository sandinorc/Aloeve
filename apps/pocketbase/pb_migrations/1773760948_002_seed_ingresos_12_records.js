/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("ingresos");

  const record0 = new Record(collection);
    record0.set("fecha", "2026-03-01");
    record0.set("linea_negocio", "L1 Experiencias regulares");
    record0.set("descripcion", "Experiencia de senderismo matutino");
    record0.set("monto", 5600);
    record0.set("participantes", 14);
    record0.set("metodo_pago", "transferencia");
    record0.set("referencia_sesion", "SEND-001");
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
    record1.set("fecha", "2026-03-02");
    record1.set("linea_negocio", "L1 Experiencias regulares");
    record1.set("descripcion", "Taller de cocina tradicional");
    record1.set("monto", 4200);
    record1.set("participantes", 10);
    record1.set("metodo_pago", "efectivo");
    record1.set("referencia_sesion", "COOK-001");
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
    record2.set("fecha", "2026-03-03");
    record2.set("linea_negocio", "L1 Experiencias regulares");
    record2.set("descripcion", "Tour cultural ciudad");
    record2.set("monto", 3800);
    record2.set("participantes", 8);
    record2.set("metodo_pago", "tarjeta");
    record2.set("referencia_sesion", "TOUR-001");
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
    record3.set("fecha", "2026-03-05");
    record3.set("linea_negocio", "L2 Formaci\u00f3n");
    record3.set("descripcion", "Curso de fotograf\u00eda digital");
    record3.set("monto", 6000);
    record3.set("participantes", 12);
    record3.set("metodo_pago", "transferencia");
    record3.set("referencia_sesion", "FOTO-001");
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
    record4.set("fecha", "2026-03-07");
    record4.set("linea_negocio", "L2 Formaci\u00f3n");
    record4.set("descripcion", "Taller de escritura creativa");
    record4.set("monto", 4000);
    record4.set("participantes", 8);
    record4.set("metodo_pago", "efectivo");
    record4.set("referencia_sesion", "ESCR-001");
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
    record5.set("fecha", "2026-03-10");
    record5.set("linea_negocio", "L3 Privados");
    record5.set("descripcion", "Evento corporativo privado");
    record5.set("monto", 5200);
    record5.set("participantes", 25);
    record5.set("metodo_pago", "transferencia");
    record5.set("referencia_sesion", "PRIV-001");
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
    record6.set("fecha", "2026-03-12");
    record6.set("linea_negocio", "L3 Privados");
    record6.set("descripcion", "Retiro ejecutivo personalizado");
    record6.set("monto", 4400);
    record6.set("participantes", 18);
    record6.set("metodo_pago", "tarjeta");
    record6.set("referencia_sesion", "PRIV-002");
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
    record7.set("fecha", "2026-03-15");
    record7.set("linea_negocio", "L4 Turismo");
    record7.set("descripcion", "Paquete tur\u00edstico 3 d\u00edas");
    record7.set("monto", 4200);
    record7.set("participantes", 6);
    record7.set("metodo_pago", "transferencia");
    record7.set("referencia_sesion", "TUR-001");
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
    record8.set("fecha", "2026-03-18");
    record8.set("linea_negocio", "L4 Turismo");
    record8.set("descripcion", "Excursi\u00f3n de aventura");
    record8.set("monto", 2800);
    record8.set("participantes", 4);
    record8.set("metodo_pago", "efectivo");
    record8.set("referencia_sesion", "TUR-002");
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
    record9.set("fecha", "2026-03-20");
    record9.set("linea_negocio", "L5 Corporativo");
    record9.set("descripcion", "Capacitaci\u00f3n empresarial");
    record9.set("monto", 2400);
    record9.set("participantes", 20);
    record9.set("metodo_pago", "transferencia");
    record9.set("referencia_sesion", "CORP-001");
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
    record10.set("fecha", "2026-03-25");
    record10.set("linea_negocio", "L1 Experiencias regulares");
    record10.set("descripcion", "Yoga y meditaci\u00f3n");
    record10.set("monto", 2800);
    record10.set("participantes", 12);
    record10.set("metodo_pago", "tarjeta");
    record10.set("referencia_sesion", "YOGA-001");
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
    record11.set("fecha", "2026-03-28");
    record11.set("linea_negocio", "L2 Formaci\u00f3n");
    record11.set("descripcion", "Seminario de liderazgo");
    record11.set("monto", 2800);
    record11.set("participantes", 15);
    record11.set("metodo_pago", "efectivo");
    record11.set("referencia_sesion", "LIDER-001");
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