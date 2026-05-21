const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../config/db');
const accessEventService = require('./accessEventService');

const loginSecure = async ({ email, password, platform, deviceIdentifier }) => {
    const accountResult = await query(
        `SELECT a.account_id,
                a.email,
                a.password_hash,
                a.role,
                a.is_active AS account_active,
                a.employee_id,
                e.first_name,
                e.last_name,
                e.is_active AS employee_active
         FROM accounts a
         INNER JOIN employees e ON e.employee_id = a.employee_id
         WHERE a.email = $1`,
        [email]
    );

    const account = accountResult.rows[0];

    if (!account) {
        return null;
    }

    if (!account.account_active || !account.employee_active) {
        const error = new Error('This account or employee access is inactive');
        error.statusCode = 403;
        throw error;
    }

    const passwordMatches = await bcrypt.compare(password, account.password_hash);

    if (!passwordMatches) {
        return null;
    }

    const accessSeed = crypto.randomBytes(32).toString('hex').toUpperCase();

    await query(
        `DELETE FROM smartphones
         WHERE employee_id = $1 OR device_identifier = $2`,
        [account.employee_id, deviceIdentifier]
    );

    await query(
        `INSERT INTO smartphones (employee_id, platform, device_identifier, access_seed, is_trusted)
         VALUES ($1, $2, $3, $4, true)`,
        [account.employee_id, platform || 'mobile', deviceIdentifier, accessSeed]
    );

    return {
        accessSeed,
        user: {
            accountId: account.account_id,
            employeeId: account.employee_id,
            email: account.email,
            name: `${account.first_name} ${account.last_name}`,
            role: account.role
        }
    };
};

const validateAccess = async ({ accessSeed }) => {
    const result = await accessEventService.validateAccessSeed({
        accessSeed,
        eventType: 'ENTRY',
        gateCode: 'GATE_MAIN'
    });

    if (!result.success || result.status !== 'ALLOWED') {
        return {
            authorized: false,
            message: result.message || 'Access denied'
        };
    }

    return {
        authorized: true,
        name: `${result.employee.firstName} ${result.employee.lastName}`,
        employee: result.employee
    };
};

module.exports = {
    loginSecure,
    validateAccess
};
