import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', ctrl.register);            // POST /api/auth/register
router.post('/login',    ctrl.login);               // POST /api/auth/login
router.get('/me',        authenticate, ctrl.me);    // GET  /api/auth/me  (protected)

export default router;
