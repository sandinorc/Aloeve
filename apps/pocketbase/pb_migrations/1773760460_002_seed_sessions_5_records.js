/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("sessions");

  const record0 = new Record(collection);
    record0.set("date", "2026-03-10");
    record0.set("time", "14:00");
    record0.set("title", "Experiencia regular Grupo A");
    record0.set("status", "realizada");
    record0.set("participants_count", 8);
    record0.set("line_of_business", "L1-Experiencias regulares");
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
    record1.set("date", "2026-03-12");
    record1.set("time", "10:00");
    record1.set("title", "Tour tur\u00edstico creativo");
    record1.set("status", "realizada");
    record1.set("participants_count", 12);
    record1.set("line_of_business", "L4-Turismo");
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
    record2.set("date", "2026-03-15");
    record2.set("time", "09:00");
    record2.set("title", "Taller corporativo empresa X");
    record2.set("status", "realizada");
    record2.set("participants_count", 15);
    record2.set("line_of_business", "L5-Corporativo");
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
    record3.set("date", "2026-03-18");
    record3.set("time", "15:00");
    record3.set("title", "Formaci\u00f3n taller pintura");
    record3.set("status", "programada");
    record3.set("participants_count", 6);
    record3.set("line_of_business", "L2-Formaci\u00f3n");
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
    record4.set("date", "2026-03-20");
    record4.set("time", "11:00");
    record4.set("title", "Sesi\u00f3n privada dise\u00f1o");
    record4.set("status", "programada");
    record4.set("participants_count", 1);
    record4.set("line_of_business", "L3-Privados");
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