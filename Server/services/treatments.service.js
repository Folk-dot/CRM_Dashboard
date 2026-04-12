import pool from '../db/pool.js';

export const getAllTreatments = async ({ category } = {}) => {
    const values = [];
    const where  = category ? (values.push(category), `WHERE category = $1`) : '';
    const { rows } = await pool.query(
        `SELECT * FROM treatments ${where} ORDER BY category, name`,
        values
    );
    return rows;
};

export const getTreatmentById = async (id) => {
    const { rows } = await pool.query(`SELECT * FROM treatments WHERE id = $1`, [id]);
    return rows[0] ?? null;
};

export const createTreatment = async (data) => {
    const { name, category, duration_min, base_price } = data;
    const { rows } = await pool.query(
        `INSERT INTO treatments (name, category, duration_min, base_price)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [name, category, duration_min, base_price]
    );
    return rows[0];
};

export const updateTreatment = async (id, data) => {
    const fields = [];
    const values = [];
    const allowed = ['name','category','duration_min','base_price'];
    allowed.forEach((key) => {
        if (data[key] !== undefined) {
            values.push(data[key]);
            fields.push(`${key} = $${values.length}`);
        }
    });
    if (!fields.length) return null;
    values.push(id);
    const { rows } = await pool.query(
        `UPDATE treatments SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
        values
    );
    return rows[0] ?? null;
};

export const deleteTreatment = async (id) => {
    const { rows } = await pool.query(`DELETE FROM treatments WHERE id = $1 RETURNING *`, [id]);
    return rows[0] ?? null;
};
