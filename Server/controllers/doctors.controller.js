import * as doctorsService from '../services/doctors.service.js';

export const getAll = async (req, res, next) => {
    try {
        res.json(await doctorsService.getAllDoctors());
    } catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
    try {
        const doc = await doctorsService.getDoctorById(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Doctor not found' });
        res.json(doc);
    } catch (err) { next(err); }
};

export const getAppointments = async (req, res, next) => {
    try {
        res.json(await doctorsService.getDoctorAppointments(req.params.id));
    } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
    try {
        if (!req.body.full_name) return res.status(400).json({ error: 'full_name is required' });
        res.status(201).json(await doctorsService.createDoctor(req.body));
    } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
    try {
        const doc = await doctorsService.updateDoctor(req.params.id, req.body);
        if (!doc) return res.status(404).json({ error: 'Doctor not found or no fields to update' });
        res.json(doc);
    } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
    try {
        const doc = await doctorsService.deleteDoctor(req.params.id);
        if (!doc) return res.status(404).json({ error: 'Doctor not found' });
        res.json({ message: 'Doctor deleted', doctor: doc });
    } catch (err) { next(err); }
};
