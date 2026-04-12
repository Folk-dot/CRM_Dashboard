import * as authService from '../services/auth.service.js';

export const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, role } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: 'first_name, last_name, email and password are required' });
        }
        const user = await authService.register({ first_name, last_name, email, password, role });
        res.status(201).json({ message: 'User registered', user });
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'email and password are required' });
        }
        const result = await authService.login({ email, password });
        res.json(result);
    } catch (err) {
        if (err.status) return res.status(err.status).json({ error: err.message });
        next(err);
    }
};

export const me = async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) { next(err); }
};
