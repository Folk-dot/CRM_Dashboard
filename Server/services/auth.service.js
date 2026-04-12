import pool from '../db/pool.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

export const register = async ({ first_name, last_name, email, password, role = 'receptionist' }) => {
    const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (existing.rows.length) {
        throw Object.assign(new Error('Email already registered'), { status: 409 });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const { rows } = await pool.query(
        `INSERT INTO users (first_name, last_name, email, password, role)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, first_name, last_name, email, role`,
        [first_name, last_name, email, hashed, role]
    );
    return rows[0];
};

export const login = async ({ email, password }) => {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = rows[0];
    if (!user) {
        throw Object.assign(new Error('Invalid email or password'), { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        throw Object.assign(new Error('Invalid email or password'), { status: 401 });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return {
        token,
        user: { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role }
    };
};

export const getUserById = async (id) => {
    const { rows } = await pool.query(
        `SELECT id, first_name, last_name, email, role FROM users WHERE id = $1`,
        [id]
    );
    return rows[0] ?? null;
};
