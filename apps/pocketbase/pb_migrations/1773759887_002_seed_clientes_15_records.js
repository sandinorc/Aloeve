/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("clientes");

  const record0 = new Record(collection);
    record0.set("nombre_completo", "Mar\u00eda Garc\u00eda L\u00f3pez");
    record0.set("telefono", "809-123-4567");
    record0.set("email", "maria.garcia@email.com");
    record0.set("tipo", "adulto");
    record0.set("fecha_primera_visita", "2024-01-15");
    record0.set("fuente", "plaza");
    record0.set("num_sesiones", 5);
    record0.set("ultima_sesion", "2024-12-10");
    record0.set("paquete_activo", true);
    record0.set("notas_internas", "Cliente frecuente, muy entusiasta");
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
    record1.set("nombre_completo", "Juan P\u00e9rez Mart\u00ednez");
    record1.set("telefono", "809-234-5678");
    record1.set("email", "juan.perez@email.com");
    record1.set("tipo", "adulto");
    record1.set("fecha_primera_visita", "2024-02-20");
    record1.set("fuente", "digital");
    record1.set("num_sesiones", 3);
    record1.set("ultima_sesion", "2024-11-25");
    record1.set("paquete_activo", false);
    record1.set("notas_internas", "Interesado en clases privadas");
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
    record2.set("nombre_completo", "Ana Rodr\u00edguez Silva");
    record2.set("telefono", "809-345-6789");
    record2.set("email", "ana.rodriguez@email.com");
    record2.set("tipo", "adulto");
    record2.set("fecha_primera_visita", "2024-03-10");
    record2.set("fuente", "referido");
    record2.set("num_sesiones", 8);
    record2.set("ultima_sesion", "2024-12-15");
    record2.set("paquete_activo", true);
    record2.set("notas_internas", "Muy dedicada, considera ser facilitadora");
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
    record3.set("nombre_completo", "Carlos Fern\u00e1ndez D\u00edaz");
    record3.set("telefono", "809-456-7890");
    record3.set("email", "carlos.fernandez@email.com");
    record3.set("tipo", "corporativo");
    record3.set("fecha_primera_visita", "2024-04-05");
    record3.set("fuente", "digital");
    record3.set("num_sesiones", 2);
    record3.set("ultima_sesion", "2024-10-30");
    record3.set("paquete_activo", false);
    record3.set("notas_internas", "Empresa de seguros, evento de team building");
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
    record4.set("nombre_completo", "Laura S\u00e1nchez G\u00f3mez");
    record4.set("telefono", "809-567-8901");
    record4.set("email", "laura.sanchez@email.com");
    record4.set("tipo", "adulto");
    record4.set("fecha_primera_visita", "2024-05-12");
    record4.set("fuente", "plaza");
    record4.set("num_sesiones", 4);
    record4.set("ultima_sesion", "2024-12-08");
    record4.set("paquete_activo", true);
    record4.set("notas_internas", "Prefiere Paint & Wine");
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
    record5.set("nombre_completo", "Diego Morales Ruiz");
    record5.set("telefono", "809-678-9012");
    record5.set("email", "diego.morales@email.com");
    record5.set("tipo", "adolescente");
    record5.set("fecha_primera_visita", "2024-06-01");
    record5.set("fuente", "referido");
    record5.set("num_sesiones", 6);
    record5.set("ultima_sesion", "2024-12-12");
    record5.set("paquete_activo", true);
    record5.set("notas_internas", "Muy talentoso, asiste con amigos");
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
    record6.set("nombre_completo", "Sof\u00eda Castillo Vega");
    record6.set("telefono", "809-789-0123");
    record6.set("email", "sofia.castillo@email.com");
    record6.set("tipo", "adulto");
    record6.set("fecha_primera_visita", "2024-07-08");
    record6.set("fuente", "digital");
    record6.set("num_sesiones", 2);
    record6.set("ultima_sesion", "2024-11-20");
    record6.set("paquete_activo", false);
    record6.set("notas_internas", "Interesada en clases de caf\u00e9 y pintura");
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
    record7.set("nombre_completo", "Roberto Jim\u00e9nez L\u00f3pez");
    record7.set("telefono", "809-890-1234");
    record7.set("email", "roberto.jimenez@email.com");
    record7.set("tipo", "corporativo");
    record7.set("fecha_primera_visita", "2024-08-15");
    record7.set("fuente", "plaza");
    record7.set("num_sesiones", 1);
    record7.set("ultima_sesion", "2024-09-10");
    record7.set("paquete_activo", false);
    record7.set("notas_internas", "Evento corporativo \u00fanico");
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
    record8.set("nombre_completo", "Valentina Ortiz Mendez");
    record8.set("telefono", "809-901-2345");
    record8.set("email", "valentina.ortiz@email.com");
    record8.set("tipo", "turista");
    record8.set("fecha_primera_visita", "2024-09-20");
    record8.set("fuente", "digital");
    record8.set("num_sesiones", 1);
    record8.set("ultima_sesion", "2024-09-22");
    record8.set("paquete_activo", false);
    record8.set("notas_internas", "Turista de Puerto Rico, experiencia \u00fanica");
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
    record9.set("nombre_completo", "Marcos Delgado Flores");
    record9.set("telefono", "809-012-3456");
    record9.set("email", "marcos.delgado@email.com");
    record9.set("tipo", "adulto");
    record9.set("fecha_primera_visita", "2024-10-05");
    record9.set("fuente", "referido");
    record9.set("num_sesiones", 3);
    record9.set("ultima_sesion", "2024-12-01");
    record9.set("paquete_activo", false);
    record9.set("notas_internas", "Amigo de Ana Rodr\u00edguez");
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
    record10.set("nombre_completo", "Gabriela N\u00fa\u00f1ez Reyes");
    record10.set("telefono", "809-123-5678");
    record10.set("email", "gabriela.nunez@email.com");
    record10.set("tipo", "adolescente");
    record10.set("fecha_primera_visita", "2024-10-18");
    record10.set("fuente", "plaza");
    record10.set("num_sesiones", 4);
    record10.set("ultima_sesion", "2024-12-14");
    record10.set("paquete_activo", true);
    record10.set("notas_internas", "Asiste con su hermana");
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
    record11.set("nombre_completo", "Fernando Herrera Campos");
    record11.set("telefono", "809-234-6789");
    record11.set("email", "fernando.herrera@email.com");
    record11.set("tipo", "adulto");
    record11.set("fecha_primera_visita", "2024-11-02");
    record11.set("fuente", "digital");
    record11.set("num_sesiones", 2);
    record11.set("ultima_sesion", "2024-12-09");
    record11.set("paquete_activo", false);
    record11.set("notas_internas", "Interesado en pintura libre");
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
    record12.set("nombre_completo", "Isabela Vargas Soto");
    record12.set("telefono", "809-345-7890");
    record12.set("email", "isabela.vargas@email.com");
    record12.set("tipo", "corporativo");
    record12.set("fecha_primera_visita", "2024-11-15");
    record12.set("fuente", "plaza");
    record12.set("num_sesiones", 1);
    record12.set("ultima_sesion", "2024-11-18");
    record12.set("paquete_activo", false);
    record12.set("notas_internas", "Empresa de consultor\u00eda");
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
    record13.set("nombre_completo", "Andr\u00e9s Medina Acosta");
    record13.set("telefono", "809-456-8901");
    record13.set("email", "andres.medina@email.com");
    record13.set("tipo", "adulto");
    record13.set("fecha_primera_visita", "2024-11-25");
    record13.set("fuente", "referido");
    record13.set("num_sesiones", 1);
    record13.set("ultima_sesion", "2024-12-02");
    record13.set("paquete_activo", false);
    record13.set("notas_internas", "Referido por Laura S\u00e1nchez");
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
    record14.set("nombre_completo", "Catalina Rojas Mendoza");
    record14.set("telefono", "809-567-9012");
    record14.set("email", "catalina.rojas@email.com");
    record14.set("tipo", "turista");
    record14.set("fecha_primera_visita", "2024-12-01");
    record14.set("fuente", "digital");
    record14.set("num_sesiones", 1);
    record14.set("ultima_sesion", "2024-12-03");
    record14.set("paquete_activo", false);
    record14.set("notas_internas", "Turista de Colombia");
  try {
    app.save(record14);
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