import { Router } from 'express';
import * as ctrl from '../controllers/reminders.controller.js';

const router = Router();

router.get('/overdue', ctrl.getOverdue);  // GET  /api/reminders/overdue
router.get('/',        ctrl.getAll);      // GET  /api/reminders?status=Overdue&patient_id=5
router.get('/:id',     ctrl.getById);     // GET  /api/reminders/1
router.post('/',       ctrl.create);      // POST /api/reminders
router.patch('/:id',   ctrl.update);      // PATCH /api/reminders/1
router.delete('/:id',  ctrl.remove);      // DELETE /api/reminders/1

export default router;
