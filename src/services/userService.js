const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { ROLES } = require('../utils/roles');

const toUserResponse = (user) => ({
    userId: user.user_id,
    email: user.email,
    role: user.role,
    divisionId: user.division_id,
    isActive: user.is_active,
    createdAt: user.created_at
});

const getUsers = async (user) => {
    const whereClause = user.role === ROLES.HR
        ? `WHERE role NOT IN ('admin', 'hr')`
        : '';

    const result = await query(
        `SELECT user_id, email, role, division_id, is_active, created_at
         FROM users
         ${whereClause}
         ORDER BY created_at DESC`
    );

    return result.rows.map(toUserResponse);
};

const createUser = async ({ email, password, role, divisionId, isActive = true }) => {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query(
        `INSERT INTO users (email, password_hash, role, division_id, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING user_id, email, role, division_id, is_active, created_at`,
        [email, passwordHash, role, divisionId || null, isActive]
    );

    return toUserResponse(result.rows[0]);
};

const getUserById = async (userId) => {
    const result = await query(
        `SELECT user_id, email, role, division_id, is_active, created_at
         FROM users
         WHERE user_id = $1`,
        [userId]
    );

    return result.rows[0] ? toUserResponse(result.rows[0]) : null;
};

const updateUser = async (userId, payload) => {
    const existingUser = await getUserById(userId);

    if (!existingUser) {
        return null;
    }

    const passwordHash = payload.password
        ? await bcrypt.hash(payload.password, 10)
        : null;

    const result = await query(
        `UPDATE users
         SET email = $1,
             password_hash = COALESCE($2, password_hash),
             role = $3,
             division_id = $4,
             is_active = $5
         WHERE user_id = $6
         RETURNING user_id, email, role, division_id, is_active, created_at`,
        [
            payload.email !== undefined ? payload.email : existingUser.email,
            passwordHash,
            payload.role !== undefined ? payload.role : existingUser.role,
            payload.divisionId !== undefined ? payload.divisionId : existingUser.divisionId,
            payload.isActive !== undefined ? payload.isActive : existingUser.isActive,
            userId
        ]
    );

    return toUserResponse(result.rows[0]);
};

const deleteUser = async (userId) => {
    const result = await query(
        `DELETE FROM users
         WHERE user_id = $1
         RETURNING user_id, email, role, division_id, is_active, created_at`,
        [userId]
    );

    return result.rows[0] ? toUserResponse(result.rows[0]) : null;
};

module.exports = {
    getUsers,
    createUser,
    getUserById,
    updateUser,
    deleteUser
};
