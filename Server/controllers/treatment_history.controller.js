import * as thService from '../services/treatment_history.service.js';

export const getAll = async (req, res, next) => {
    try {
        const { patient_id } = req.query;
        res.json(await thService.getAllTreatmentHistory({ patient_id }));
    } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
    try {
        const record = await thService.getTreatmentHistoryById(req.params.id);
        if (!record) return res.status(404).json({ error: 'Treatment history record not found' });
        res.json(record);
    } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
    try {
        const { patient_id, performed_at } = req.body;
        if (!patient_id || !performed_at) {
            return res.status(400).json({ error: 'patient_id and performed_at are required' });
        }
        res.status(201).json(await thService.createTreatmentHistory(req.body));
    } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
    try {
        const record = await thService.updateTreatmentHistory(req.params.id, req.body);
        if (!record) return res.status(404).json({ error: 'Record not found or no fields to update' });
        res.json(record);
    } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
    try {
        const record = await thService.deleteTreatmentHistory(req.params.id);
        if (!record) return res.status(404).json({ error: 'Record not found' });
        res.json({ message: 'Treatment history record deleted', record });
    } catch (err) { next(err); }
};
