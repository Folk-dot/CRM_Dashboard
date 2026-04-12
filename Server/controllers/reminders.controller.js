import * as remindersService from '../services/reminders.service.js';

export const getAll = async (req, res, next) => {
    try {
        const { status, patient_id } = req.query;
        res.json(await remindersService.getAllReminders({ status, patient_id }));
    } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
    try {
        const reminder = await remindersService.getReminderById(req.params.id);
        if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
        res.json(reminder);
    } catch (err) { next(err); }
};

export const getOverdue = async (req, res, next) => {
    try {
        res.json(await remindersService.getOverdueReminders());
    } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
    try {
        const { patient_id, due_date } = req.body;
        if (!patient_id || !due_date) return res.status(400).json({ error: 'patient_id and due_date are required' });
        res.status(201).json(await remindersService.createReminder(req.body));
    } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
    try {
        const reminder = await remindersService.updateReminder(req.params.id, req.body);
        if (!reminder) return res.status(404).json({ error: 'Reminder not found or no fields to update' });
        res.json(reminder);
    } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
    try {
        const reminder = await remindersService.deleteReminder(req.params.id);
        if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
        res.json({ message: 'Reminder deleted', reminder });
    } catch (err) { next(err); }
};
