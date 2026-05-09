const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const buildUserResponse = (user) => ({
    userId: user.user_id,
    email: user.email,
    role: user.role,
    divisionId: user.division_id,
    isActive: user.is_active
});

const login = async ({ email, password }) => {
    const result = await query(
        `SELECT user_id, email, password_hash, role, division_id, is_active
         FROM users
         WHERE email = $1`,
        [email]
    );

    const user = result.rows[0];

    if (!user || !user.is_active) {
        return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
        return null;
    }

    const token = jwt.sign(
        {
            userId: user.user_id,
            email: user.email,
            role: user.role,
            divisionId: user.division_id
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    return {
        token,
        user: buildUserResponse(user)
    };
};

module.exports = {
    login
};
