import { Router } from 'express';
import healthCheck from './health-check.js';
import diagnosticsRouter from './diagnostics.js';
import authRouter from './auth.js';
import permissionsRouter from './permissions.js';
import studiesRouter from './estudios.js';
import workshopsRouter from './talleres.js';
import facilitatorsRouter from './facilitadores.js';
import usersRouter from './usuarios.js';
import scheduleRouter from './schedule.js';
import clientesRouter from './clientes.js';
import inscripcionesRouter from './inscripciones.js';
import pagosRouter from './pagos.js';
import sesionesRouter from './sesiones.js';
import productosRouter from './productos.js';
import clientesPosRouter from './clientes-pos.js';
import ventasPosRouter from './ventas-pos.js';
import historialSesionesClienteRouter from './historial-sesiones-cliente.js';
import historialInventarioRouter from './historial-inventario.js';
import rolesRouter from './roles.js';

const router = Router();

export default () => {
  router.get('/health', healthCheck);
  router.use('/diagnostics', diagnosticsRouter);
  router.use('/auth', authRouter);
  router.use('/permissions', permissionsRouter);
  router.use('/estudios', studiesRouter);
  router.use('/talleres', workshopsRouter);
  router.use('/facilitadores', facilitatorsRouter);
  router.use('/usuarios', usersRouter);
  router.use('/', scheduleRouter);
  router.use('/clientes', clientesRouter);
  router.use('/inscripciones', inscripcionesRouter);
  router.use('/pagos', pagosRouter);
  router.use('/sesiones', sesionesRouter);
  router.use('/productos', productosRouter);
  router.use('/clientes-pos', clientesPosRouter);
  router.use('/ventas-pos', ventasPosRouter);
  router.use('/historial-sesiones-cliente', historialSesionesClienteRouter);
  router.use('/historial-inventario', historialInventarioRouter);
  router.use('/roles', rolesRouter);

  return router;
};