const { query } = require('../config/db');

const toGateAccessEntry = (row) => ({
    employeeId: row.employee_id,
    firstName: row.first_name,
    lastName: row.last_name,
    divisionId: row.division_id,
    divisionName: row.division_name,
    bluetoothCode: row.bluetooth_code,
    carNumber: row.car_number,
    accessStartTime: row.access_start_time,
    accessEndTime: row.access_end_time,
    smartphone: row.smartphone_id
        ? {
            smartphoneId: row.smartphone_id,
            platform: row.platform,
            deviceIdentifier: row.device_identifier,
            accessSeed: row.access_seed,
            isTrusted: row.is_trusted,
            registeredAt: row.registered_at
        }
        : null
});

const getGateAccessList = async () => {
    const result = await query(
        `SELECT e.employee_id,
                e.first_name,
                e.last_name,
                e.division_id,
                d.name AS division_name,
                e.bluetooth_code,
                e.car_number,
                e.access_start_time,
                e.access_end_time,
                s.smartphone_id,
                s.platform,
                s.device_identifier,
                s.access_seed,
                s.is_trusted,
                s.registered_at
         FROM employees e
         INNER JOIN divisions d ON d.division_id = e.division_id
         LEFT JOIN smartphones s ON s.employee_id = e.employee_id AND s.is_trusted = true
         WHERE e.is_active = true
         ORDER BY e.employee_id ASC`
    );

    return {
        generatedAt: new Date().toISOString(),
        items: result.rows.map(toGateAccessEntry)
    };
};

module.exports = {
    getGateAccessList
};
