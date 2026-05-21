const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const buildUserResponse = (user) => ({
    accountId: user.account_id,
    email: user.email,
    role: user.role,
    divisionId: user.division_id,
    employeeId: user.employee_id,
    isActive: user.is_active
});

const login = async ({ email, password }) => {
    const result = await query(
        `SELECT account_id, email, password_hash, role, division_id, employee_id, is_active
         FROM accounts
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
            accountId: user.account_id,
            email: user.email,
            role: user.role,
            divisionId: user.division_id,
            employeeId: user.employee_id
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
