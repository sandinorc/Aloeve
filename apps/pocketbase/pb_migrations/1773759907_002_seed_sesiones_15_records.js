/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("sesiones");

  const record0 = new Record(collection);
    record0.set("fecha", "2024-10-05");
    record0.set("hora_inicio", "18:00");
    record0.set("hora_fin", "20:00");
    record0.set("tipo", "Paint_Wine");
    record0.set("facilitador", "Mar\u00eda");
    record0.set("capacidad_maxima", 12);
    record0.set("cupos_reservados", 10);
    record0.set("asistentes_reales", 9);
    record0.set("estado", "cerrada");
    record0.set("ingresos_totales", 2700);
    record0.set("notas", "Sesi\u00f3n exitosa");
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
    record1.set("fecha", "2024-10-12");
    record1.set("hora_inicio", "19:00");
    record1.set("hora_fin", "21:00");
    record1.set("tipo", "Cafe_Paint");
    record1.set("facilitador", "Juan");
    record1.set("capacidad_maxima", 10);
    record1.set("cupos_reservados", 8);
    record1.set("asistentes_reales", 8);
    record1.set("estado", "cerrada");
    record1.set("ingresos_totales", 2400);
    record1.set("notas", "Buena asistencia");
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
    record2.set("fecha", "2024-10-19");
    record2.set("hora_inicio", "15:00");
    record2.set("hora_fin", "17:00");
    record2.set("tipo", "Adolescentes");
    record2.set("facilitador", "Carlos");
    record2.set("capacidad_maxima", 15);
    record2.set("cupos_reservados", 12);
    record2.set("asistentes_reales", 11);
    record2.set("estado", "cerrada");
    record2.set("ingresos_totales", 1650);
    record2.set("notas", "Grupo muy entusiasta");
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
    record3.set("fecha", "2024-10-26");
    record3.set("hora_inicio", "18:00");
    record3.set("hora_fin", "20:00");
    record3.set("tipo", "Privado");
    record3.set("facilitador", "Mar\u00eda");
    record3.set("capacidad_maxima", 8);
    record3.set("cupos_reservados", 8);
    record3.set("asistentes_reales", 8);
    record3.set("estado", "cerrada");
    record3.set("ingresos_totales", 3200);
    record3.set("notas", "Evento privado corporativo");
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
    record4.set("fecha", "2024-11-02");
    record4.set("hora_inicio", "19:00");
    record4.set("hora_fin", "21:00");
    record4.set("tipo", "Paint_Wine");
    record4.set("facilitador", "Juan");
    record4.set("capacidad_maxima", 12);
    record4.set("cupos_reservados", 11);
    record4.set("asistentes_reales", 10);
    record4.set("estado", "cerrada");
    record4.set("ingresos_totales", 3000);
    record4.set("notas", "Excelente participaci\u00f3n");
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
    record5.set("fecha", "2024-11-09");
    record5.set("hora_inicio", "18:00");
    record5.set("hora_fin", "20:00");
    record5.set("tipo", "Corporativo");
    record5.set("facilitador", "Carlos");
    record5.set("capacidad_maxima", 20);
    record5.set("cupos_reservados", 18);
    record5.set("asistentes_reales", 17);
    record5.set("estado", "cerrada");
    record5.set("ingresos_totales", 5100);
    record5.set("notas", "Evento corporativo grande");
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
    record6.set("fecha", "2024-11-16");
    record6.set("hora_inicio", "15:00");
    record6.set("hora_fin", "17:00");
    record6.set("tipo", "Turismo");
    record6.set("facilitador", "Mar\u00eda");
    record6.set("capacidad_maxima", 10);
    record6.set("cupos_reservados", 9);
    record6.set("asistentes_reales", 9);
    record6.set("estado", "cerrada");
    record6.set("ingresos_totales", 2700);
    record6.set("notas", "Turistas internacionales");
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
    record7.set("fecha", "2024-11-23");
    record7.set("hora_inicio", "19:00");
    record7.set("hora_fin", "21:00");
    record7.set("tipo", "Pintura_libre");
    record7.set("facilitador", "Juan");
    record7.set("capacidad_maxima", 15);
    record7.set("cupos_reservados", 12);
    record7.set("asistentes_reales", 12);
    record7.set("estado", "cerrada");
    record7.set("ingresos_totales", 1800);
    record7.set("notas", "Sesi\u00f3n de pintura libre");
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
    record8.set("fecha", "2024-11-30");
    record8.set("hora_inicio", "18:00");
    record8.set("hora_fin", "20:00");
    record8.set("tipo", "Cafe_Paint");
    record8.set("facilitador", "Carlos");
    record8.set("capacidad_maxima", 10);
    record8.set("cupos_reservados", 9);
    record8.set("asistentes_reales", 9);
    record8.set("estado", "cerrada");
    record8.set("ingresos_totales", 2700);
    record8.set("notas", "Buena participaci\u00f3n");
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
    record9.set("fecha", "2024-12-07");
    record9.set("hora_inicio", "19:00");
    record9.set("hora_fin", "21:00");
    record9.set("tipo", "Paint_Wine");
    record9.set("facilitador", "Mar\u00eda");
    record9.set("capacidad_maxima", 12);
    record9.set("cupos_reservados", 10);
    record9.set("asistentes_reales", 10);
    record9.set("estado", "cerrada");
    record9.set("ingresos_totales", 3000);
    record9.set("notas", "Sesi\u00f3n de fin de a\u00f1o");
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
    record10.set("fecha", "2024-12-14");
    record10.set("hora_inicio", "18:00");
    record10.set("hora_fin", "20:00");
    record10.set("tipo", "Adolescentes");
    record10.set("facilitador", "Juan");
    record10.set("capacidad_maxima", 15);
    record10.set("cupos_reservados", 13);
    record10.set("asistentes_reales", 0);
    record10.set("estado", "programada");
    record10.set("ingresos_totales", null);
    record10.set("notas", "Pr\u00f3xima sesi\u00f3n");
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
    record11.set("fecha", "2024-12-21");
    record11.set("hora_inicio", "19:00");
    record11.set("hora_fin", "21:00");
    record11.set("tipo", "Paint_Wine");
    record11.set("facilitador", "Carlos");
    record11.set("capacidad_maxima", 12);
    record11.set("cupos_reservados", 8);
    record11.set("asistentes_reales", 0);
    record11.set("estado", "programada");
    record11.set("ingresos_totales", null);
    record11.set("notas", "Sesi\u00f3n navide\u00f1a");
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
    record12.set("fecha", "2024-12-28");
    record12.set("hora_inicio", "15:00");
    record12.set("hora_fin", "17:00");
    record12.set("tipo", "Privado");
    record12.set("facilitador", "Mar\u00eda");
    record12.set("capacidad_maxima", 8);
    record12.set("cupos_reservados", 6);
    record12.set("asistentes_reales", 0);
    record12.set("estado", "programada");
    record12.set("ingresos_totales", null);
    record12.set("notas", "Evento privado");
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
    record13.set("fecha", "2025-01-04");
    record13.set("hora_inicio", "18:00");
    record13.set("hora_fin", "20:00");
    record13.set("tipo", "Cafe_Paint");
    record13.set("facilitador", "Juan");
    record13.set("capacidad_maxima", 10);
    record13.set("cupos_reservados", 7);
    record13.set("asistentes_reales", 0);
    record13.set("estado", "programada");
    record13.set("ingresos_totales", null);
    record13.set("notas", "Inicio de a\u00f1o");
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
    record14.set("fecha", "2025-01-11");
    record14.set("hora_inicio", "19:00");
    record14.set("hora_fin", "21:00");
    record14.set("tipo", "Corporativo");
    record14.set("facilitador", "Carlos");
    record14.set("capacidad_maxima", 20);
    record14.set("cupos_reservados", 15);
    record14.set("asistentes_reales", 0);
    record14.set("estado", "programada");
    record14.set("ingresos_totales", null);
    record14.set("notas", "Evento corporativo enero");
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