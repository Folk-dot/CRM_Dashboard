import * as treatmentsService from '../services/treatments.service.js';

export const getAll = async (req, res, next) => {
    try {
        res.json(await treatmentsService.getAllTreatments({ category: req.query.category }));
    } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
    try {
        const tx = await treatmentsService.getTreatmentById(req.params.id);
        if (!tx) return res.status(404).json({ error: 'Treatment not found' });
        res.json(tx);
    } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
    try {
        if (!req.body.name) return res.status(400).json({ error: 'name is required' });
        res.status(201).json(await treatmentsService.createTreatment(req.body));
    } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
    try {
        const tx = await treatmentsService.updateTreatment(req.params.id, req.body);
        if (!tx) return res.status(404).json({ error: 'Treatment not found or no fields to update' });
        res.json(tx);
    } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
    try {
        const tx = await treatmentsService.deleteTreatment(req.params.id);
        if (!tx) return res.status(404).json({ error: 'Treatment not found' });
        res.json({ message: 'Treatment deleted', treatment: tx });
    } catch (err) { next(err); }
};
