import { Router } from 'express';
import * as ctrl from '../controllers/appointments.controller.js';

const router = Router();

router.get('/today',  ctrl.getToday);   // GET  /api/appointments/today
router.get('/',       ctrl.getAll);     // GET  /api/appointments?status=Upcoming&date=2026-04-11&doctor_id=1
router.get('/:id',    ctrl.getById);    // GET  /api/appointments/3
router.post('/',      ctrl.create);     // POST /api/appointments
router.patch('/:id',  ctrl.update);     // PATCH /api/appointments/3
router.delete('/:id', ctrl.remove);     // DELETE /api/appointments/3

export default router;
