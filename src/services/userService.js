const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

const toUserResponse = (user) => ({
    userId: user.user_id,
    email: user.email,
    role: user.role,
    divisionId: user.division_id,
    isActive: user.is_active,
    createdAt: user.created_at
});

const getUsers = async () => {
    const result = await query(
        `SELECT user_id, email, role, division_id, is_active, created_at
         FROM users
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

module.exports = {
    getUsers,
    createUser
};
