import { Router } from 'express';
import * as ctrl from '../controllers/patients.controller.js';

const router = Router();

router.get('/',              ctrl.getAll);      // GET  /api/patients?status=Overdue&search=som
router.get('/:id',           ctrl.getById);     // GET  /api/patients/1
router.get('/:id/history',   ctrl.getHistory);  // GET  /api/patients/1/history
router.post('/',             ctrl.create);      // POST /api/patients
router.patch('/:id',         ctrl.update);      // PATCH /api/patients/1
router.delete('/:id',        ctrl.remove);      // DELETE /api/patients/1

export default router;
