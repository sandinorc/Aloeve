/// <reference path="../pb_data/types.d.ts" />
routerAdd("POST", "/api/validar-conflicto-horario", (c) => {
  const body = c.bodyAsJson();
  const facilitadorId = body.facilitador_id;
  const tallerId = body.taller_id;

  if (!facilitadorId || !tallerId) {
    throw new BadRequestError("facilitador_id y taller_id son requeridos");
  }

  // 1. Fetch the new taller from sesiones collection
  let nuevoTaller;
  try {
    nuevoTaller = $app.findRecordById("sesiones", tallerId);
  } catch (e) {
    throw new BadRequestError("Taller no encontrado");
  }

  const nuevoFecha = nuevoTaller.get("fecha");
  const nuevoHoraInicio = nuevoTaller.get("hora_inicio");
  const nuevoHoraFin = nuevoTaller.get("hora_fin");
  const nuevoNombre = nuevoTaller.get("titulo") || "Sin nombre";

  // 2. Fetch all active asignaciones for this facilitador
  let asignaciones = [];
  try {
    asignaciones = $app.findAllRecords("asignaciones_talleres", {
      filter: "facilitador_id = '" + facilitadorId + "' && estado = 'activo'"
    });
  } catch (e) {
    // No assignments found, continue
  }

  // 3. Check for conflicts
  let conflicto = null;

  for (let i = 0; i < asignaciones.length; i++) {
    const asignacion = asignaciones[i];
    const tallerAsignadoId = asignacion.get("taller_id");

    // Skip if it's the same taller
    if (tallerAsignadoId === tallerId) {
      continue;
    }

    let tallerAsignado;
    try {
      tallerAsignado = $app.findRecordById("sesiones", tallerAsignadoId);
    } catch (e) {
      continue;
    }

    const fechaAsignada = tallerAsignado.get("fecha");
    const horaInicioAsignada = tallerAsignado.get("hora_inicio");
    const horaFinAsignada = tallerAsignado.get("hora_fin");
    const nombreAsignado = tallerAsignado.get("titulo") || "Sin nombre";

    // Check if dates match
    if (fechaAsignada === nuevoFecha) {
      // Check if time ranges overlap
      if (timeRangesOverlap(nuevoHoraInicio, nuevoHoraFin, horaInicioAsignada, horaFinAsignada)) {
        conflicto = {
          nombre: nombreAsignado,
          fecha: fechaAsignada,
          hora_inicio: horaInicioAsignada,
          hora_fin: horaFinAsignada
        };
        break;
      }
    }
  }

  if (conflicto) {
    return c.json(200, {
      conflict: true,
      message: "Conflicto de horario detectado. El facilitador ya tiene asignado otro taller en esta fecha y hora.",
      conflicting_taller: conflicto
    });
  } else {
    return c.json(200, {
      conflict: false,
      message: "No hay conflictos de horario.",
      conflicting_taller: null
    });
  }
});

function timeRangesOverlap(start1, end1, start2, end2) {
  // Convert time strings (HH:MM) to minutes for comparison
  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };

  const start1Min = toMinutes(start1);
  const end1Min = toMinutes(end1);
  const start2Min = toMinutes(start2);
  const end2Min = toMinutes(end2);

  // Check if ranges overlap
  return start1Min < end2Min && start2Min < end1Min;
}