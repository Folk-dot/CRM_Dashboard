import { Router } from 'express';
import * as ctrl from '../controllers/treatments.controller.js';

const router = Router();

router.get('/',       ctrl.getAll);    // GET  /api/treatments?category=Preventive
router.get('/:id',    ctrl.getById);   // GET  /api/treatments/1
router.post('/',      ctrl.create);    // POST /api/treatments
router.patch('/:id',  ctrl.update);    // PATCH /api/treatments/1
router.delete('/:id', ctrl.remove);    // DELETE /api/treatments/1

export default router;
