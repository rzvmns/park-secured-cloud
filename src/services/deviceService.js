const { query } = require('../config/db');

const toDeviceResponse = (device) => ({
    smartphoneId: device.smartphone_id,
    employeeId: device.employee_id,
    platform: device.platform,
    deviceIdentifier: device.device_identifier,
    isTrusted: device.is_trusted,
    registeredAt: device.registered_at
});

const canAccessEmployee = async (employeeId, user) => {
    const params = [employeeId];
    const divisionClause = user.role === 'admin' ? '' : 'AND division_id = $2';

    if (user.role !== 'admin') {
        params.push(user.divisionId);
    }

    const result = await query(
        `SELECT employee_id
         FROM employees
         WHERE employee_id = $1 ${divisionClause}`,
        params
    );

    return result.rowCount > 0;
};

const registerDevice = async ({ employeeId, platform, deviceIdentifier, isTrusted = true }, user) => {
    if (!(await canAccessEmployee(employeeId, user))) {
        return null;
    }

    const result = await query(
        `INSERT INTO smartphones (employee_id, platform, device_identifier, is_trusted)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (employee_id)
         DO UPDATE SET platform = EXCLUDED.platform,
                       device_identifier = EXCLUDED.device_identifier,
                       is_trusted = EXCLUDED.is_trusted,
                       registered_at = NOW()
         RETURNING smartphone_id, employee_id, platform, device_identifier, is_trusted, registered_at`,
        [employeeId, platform, deviceIdentifier, isTrusted]
    );

    return toDeviceResponse(result.rows[0]);
};

const getDeviceByEmployeeId = async (employeeId, user) => {
    if (!(await canAccessEmployee(employeeId, user))) {
        return null;
    }

    const result = await query(
        `SELECT smartphone_id, employee_id, platform, device_identifier, is_trusted, registered_at
         FROM smartphones
         WHERE employee_id = $1`,
        [employeeId]
    );

    return result.rows[0] ? toDeviceResponse(result.rows[0]) : null;
};

module.exports = {
    registerDevice,
    getDeviceByEmployeeId
};
