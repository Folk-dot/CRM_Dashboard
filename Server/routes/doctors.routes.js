import { Router } from 'express';
import * as ctrl from '../controllers/doctors.controller.js';

const router = Router();

router.get('/',                   ctrl.getAll);           // GET  /api/doctors
router.get('/:id',                ctrl.getById);          // GET  /api/doctors/1
router.get('/:id/appointments',   ctrl.getAppointments);  // GET  /api/doctors/1/appointments
router.post('/',                  ctrl.create);           // POST /api/doctors
router.patch('/:id',              ctrl.update);           // PATCH /api/doctors/1
router.delete('/:id',             ctrl.remove);           // DELETE /api/doctors/1

export default router;
