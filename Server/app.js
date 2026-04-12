import express from 'express';
import 'dotenv/config';

import { authenticate } from './middleware/auth.middleware.js';

import authRouter             from './routes/auth.routes.js';
import patientsRouter         from './routes/patients.routes.js';
import doctorsRouter          from './routes/doctors.routes.js';
import appointmentsRouter     from './routes/appointments.routes.js';
import treatmentsRouter       from './routes/treatments.routes.js';
import remindersRouter        from './routes/reminders.routes.js';
import treatmentHistoryRouter from './routes/treatment_history.routes.js';

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Public routes (no token needed)
app.use('/api/auth', authRouter);

// Protected routes — every request below requires a valid JWT
app.use('/api/patients',          authenticate, patientsRouter);
app.use('/api/doctors',           authenticate, doctorsRouter);
app.use('/api/appointments',      authenticate, appointmentsRouter);
app.use('/api/treatments',        authenticate, treatmentsRouter);
app.use('/api/reminders',         authenticate, remindersRouter);
app.use('/api/treatment-history', authenticate, treatmentHistoryRouter);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
