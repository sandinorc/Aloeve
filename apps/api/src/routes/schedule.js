import express from 'express';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { authMiddleware } from '../middleware/rbac.js';

const router = express.Router();

/**
 * POST /validar-conflicto-horario
 * Validates scheduling conflicts for a facilitator on specific dates/times
 * Request body: { facilitadorId, tallerIds, fechaInicio, fechaFin }
 * Response: { conflictos: [] } or { conflictos: [{tallerNombre, horario, fecha}] }
 */
router.post('/validar-conflicto-horario', authMiddleware, async (req, res) => {
  // Verify authentication
  if (!req.user) {
    throw new Error('Authentication required');
  }

  const { facilitadorId, tallerIds, fechaInicio, fechaFin } = req.body;

  // Input validation
  if (!facilitadorId || !tallerIds || !Array.isArray(tallerIds) || tallerIds.length === 0) {
    return res.status(400).json({
      error: 'facilitadorId and tallerIds (non-empty array) are required',
    });
  }

  if (!fechaInicio || !fechaFin) {
    return res.status(400).json({
      error: 'fechaInicio and fechaFin are required',
    });
  }

  logger.info(
    `[schedule] User ${req.user.email} validating scheduling conflicts for facilitador ${facilitadorId} from ${fechaInicio} to ${fechaFin}`
  );

  // Fetch all sessions for the facilitator using authenticated context
  const facilitadorSessions = await pb.collection('sesiones').getFullList({
    filter: `facilitador = "${facilitadorId}"`,
  });

  logger.info(
    `[schedule] Found ${facilitadorSessions.length} existing sessions for facilitador ${facilitadorId}`
  );

  // Check for conflicts
  const conflictos = [];

  for (const session of facilitadorSessions) {
    // Skip if this session's workshop is in the tallerIds to exclude
    if (tallerIds.includes(session.taller)) {
      continue;
    }

    // Check if session date falls within the requested date range
    const sessionDate = new Date(session.fecha).getTime();
    const requestStartDate = new Date(fechaInicio).getTime();
    const requestEndDate = new Date(fechaFin).getTime();

    if (sessionDate >= requestStartDate && sessionDate <= requestEndDate) {
      // Get workshop details for the conflict report
      const workshop = await pb.collection('talleres').getOne(session.taller);

      conflictos.push({
        tallerNombre: workshop.name,
        horario: `${session.hora_inicio} - ${session.hora_fin}`,
        fecha: session.fecha,
        sessionId: session.id,
      });

      logger.warn(
        `[schedule] Conflict detected: Workshop "${workshop.name}" on ${session.fecha} from ${session.hora_inicio} to ${session.hora_fin}`
      );
    }
  }

  logger.info(
    `[schedule] Validation complete. Found ${conflictos.length} conflicts`
  );

  res.json({
    conflictos,
    facilitadorId,
    fechaInicio,
    fechaFin,
    totalConflictos: conflictos.length,
  });
});

/**
 * POST /validar-conflicto-horario-detallado
 * Alternative endpoint for detailed time-based conflict validation
 * Request body: { facilitadorId, fecha, horaInicio, horaFin, tallerIdExcluir }
 * Response: { conflicto: boolean, mensaje: string }
 */
router.post('/validar-conflicto-horario-detallado', authMiddleware, async (req, res) => {
  // Verify authentication
  if (!req.user) {
    throw new Error('Authentication required');
  }

  const { facilitadorId, fecha, horaInicio, horaFin, tallerIdExcluir } = req.body;

  // Input validation
  if (!facilitadorId || !fecha || !horaInicio || !horaFin) {
    return res.status(400).json({
      error: 'facilitadorId, fecha, horaInicio, and horaFin are required',
    });
  }

  logger.info(
    `[schedule] User ${req.user.email} validating detailed scheduling conflicts for facilitador ${facilitadorId} on ${fecha} from ${horaInicio} to ${horaFin}`
  );

  // Fetch all sessions for the facilitator using authenticated context
  const facilitadorSessions = await pb.collection('sesiones').getFullList({
    filter: `facilitador = "${facilitadorId}"`,
  });

  logger.info(
    `[schedule] Found ${facilitadorSessions.length} existing sessions for facilitador ${facilitadorId}`
  );

  // Check for conflicts on the same date
  let conflicto = false;
  let mensaje = 'No hay conflictos de horario';

  for (const session of facilitadorSessions) {
    // Skip if this is the workshop being excluded
    if (tallerIdExcluir && session.taller === tallerIdExcluir) {
      continue;
    }

    // Check if dates match
    if (session.fecha !== fecha) {
      continue;
    }

    // Parse times (assuming format HH:mm)
    const sessionStart = parseTime(session.hora_inicio);
    const sessionEnd = parseTime(session.hora_fin);
    const requestStart = parseTime(horaInicio);
    const requestEnd = parseTime(horaFin);

    // Check for time overlap
    if (requestStart < sessionEnd && requestEnd > sessionStart) {
      conflicto = true;
      mensaje = `Conflicto de horario: ${horaInicio}-${horaFin} se superpone con sesión existente ${session.hora_inicio}-${session.hora_fin}`;

      logger.warn(
        `[schedule] Conflict detected: Requested time ${horaInicio}-${horaFin} conflicts with existing session ${session.hora_inicio}-${session.hora_fin} on ${fecha}`
      );
      break;
    }
  }

  logger.info(
    `[schedule] Validation complete. Conflict found: ${conflicto}`
  );

  res.json({
    conflicto,
    mensaje,
  });
});

/**
 * Helper function to parse time string (HH:mm) to minutes since midnight
 */
function parseTime(timeString) {
  if (!timeString) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export default router;