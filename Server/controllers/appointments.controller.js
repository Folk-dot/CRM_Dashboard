import * as appointmentsService from '../services/appointments.service.js';

export const getAll = async (req, res, next) => {
    try {
        const { status, date, patient_id, doctor_id } = req.query;
        res.json(await appointmentsService.getAllAppointments({ status, date, patient_id, doctor_id }));
    } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
    try {
        const apt = await appointmentsService.getAppointmentById(req.params.id);
        if (!apt) return res.status(404).json({ error: 'Appointment not found' });
        res.json(apt);
    } catch (err) { next(err); }
};

export const getToday = async (req, res, next) => {
    try {
        res.json(await appointmentsService.getTodayAppointments());
    } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
    try {
        const { patient_id, doctor_id, scheduled_at } = req.body;
        if (!patient_id || !doctor_id || !scheduled_at) {
            return res.status(400).json({ error: 'patient_id, doctor_id and scheduled_at are required' });
        }
        res.status(201).json(await appointmentsService.createAppointment(req.body));
    } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
    try {
        const apt = await appointmentsService.updateAppointment(req.params.id, req.body);
        if (!apt) return res.status(404).json({ error: 'Appointment not found or no fields to update' });
        res.json(apt);
    } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
    try {
        const apt = await appointmentsService.deleteAppointment(req.params.id);
        if (!apt) return res.status(404).json({ error: 'Appointment not found' });
        res.json({ message: 'Appointment deleted', appointment: apt });
    } catch (err) { next(err); }
};
