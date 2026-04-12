import * as patientsService from '../services/patients.service.js';

export const getAll = async (req, res, next) => {
    try {
        const { status, search } = req.query;
        const patients = await patientsService.getAllPatients({ status, search });
        res.json(patients);
    } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
    try {
        const patient = await patientsService.getPatientById(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (err) { next(err); }
};

export const getHistory = async (req, res, next) => {
    try {
        const history = await patientsService.getPatientHistory(req.params.id);
        res.json(history);
    } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
    try {
        if (!req.body.full_name) return res.status(400).json({ error: 'full_name is required' });
        const patient = await patientsService.createPatient(req.body);
        res.status(201).json(patient);
    } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
    try {
        const patient = await patientsService.updatePatient(req.params.id, req.body);
        if (!patient) return res.status(404).json({ error: 'Patient not found or no fields to update' });
        res.json(patient);
    } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
    try {
        const patient = await patientsService.deletePatient(req.params.id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json({ message: 'Patient deleted', patient });
    } catch (err) { next(err); }
};
