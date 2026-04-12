import { Router } from 'express';
import * as ctrl from '../controllers/treatment_history.controller.js';

const router = Router();

router.get('/',       ctrl.getAll);    // GET  /api/treatment-history?patient_id=1
router.get('/:id',    ctrl.getById);   // GET  /api/treatment-history/3
router.post('/',      ctrl.create);    // POST /api/treatment-history
router.patch('/:id',  ctrl.update);    // PATCH /api/treatment-history/3
router.delete('/:id', ctrl.remove);    // DELETE /api/treatment-history/3

export default router;
