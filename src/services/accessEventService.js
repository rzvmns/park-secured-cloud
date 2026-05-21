const { query } = require('../config/db');
const { ROLES } = require('../utils/roles');

const toEventResponse = (event) => ({
    eventId: event.event_id,
    employeeId: event.employee_id,
    smartphoneId: event.smartphone_id,
    eventType: event.event_type,
    eventStatus: event.event_status,
    eventTime: event.event_time,
    gateCode: event.gate_code,
    source: event.source,
    notes: event.notes
});

const getAccessScope = (user, startIndex = 1) => {
    if (!user || user.role === ROLES.ADMIN || user.role === ROLES.HR) {
        return {
            clause: '',
            params: []
        };
    }

    return {
        clause: ` AND e.division_id = $${startIndex}`,
        params: [user.divisionId]
    };
};

const createAccessEvent = async (payload) => {
    if (payload.smartphoneId) {
        const smartphoneResult = await query(
            `SELECT smartphone_id
             FROM smartphones
             WHERE smartphone_id = $1
               AND employee_id = $2`,
            [payload.smartphoneId, payload.employeeId]
        );

        if (smartphoneResult.rowCount === 0) {
            const error = new Error('smartphoneId does not belong to employeeId');
            error.statusCode = 400;
            throw error;
        }
    }

    const result = await query(
        `INSERT INTO access_events (
            employee_id, smartphone_id, event_type, event_status, event_time, gate_code, source, notes
         )
         VALUES ($1, $2, $3, $4, COALESCE($5, NOW()), $6, $7, $8)
         RETURNING *`,
        [
            payload.employeeId,
            payload.smartphoneId || null,
            payload.eventType,
            payload.eventStatus,
            payload.eventTime || null,
            payload.gateCode || null,
            payload.source || 'gate',
            payload.notes || null
        ]
    );

    return toEventResponse(result.rows[0]);
};

const isCurrentTimeInAccessWindow = (accessStartTime, accessEndTime) => {
    if (!accessStartTime || !accessEndTime) {
        return true;
    }

    const now = new Date();
    const currentSeconds = (now.getHours() * 60 * 60) + (now.getMinutes() * 60) + now.getSeconds();
    const toSeconds = (timeValue) => {
        const [hours, minutes, seconds = '0'] = String(timeValue).split(':');
        return (Number(hours) * 60 * 60) + (Number(minutes) * 60) + Number(seconds);
    };
    const startSeconds = toSeconds(accessStartTime);
    const endSeconds = toSeconds(accessEndTime);

    if (startSeconds <= endSeconds) {
        return currentSeconds >= startSeconds && currentSeconds <= endSeconds;
    }

    return currentSeconds >= startSeconds || currentSeconds <= endSeconds;
};

const createSeedValidationEvent = async ({ employeeId, smartphoneId, eventType, eventStatus, gateCode, notes }) => {
    return createAccessEvent({
        employeeId,
        smartphoneId,
        eventType,
        eventStatus,
        gateCode,
        source: 'seed-validation',
        notes
    });
};

const validateAccessSeed = async ({ accessSeed, eventType, gateCode }) => {
    const result = await query(
        `SELECT s.smartphone_id,
                s.employee_id,
                s.is_trusted,
                e.first_name,
                e.last_name,
                e.car_number,
                e.is_active,
                e.access_start_time,
                e.access_end_time
         FROM smartphones s
         INNER JOIN employees e ON e.employee_id = s.employee_id
         WHERE s.access_seed = $1`,
        [accessSeed]
    );

    const row = result.rows[0];

    if (!row) {
        return {
            success: false,
            status: 'DENIED',
            message: 'Invalid access seed'
        };
    }

    let status = 'ALLOWED';
    let message = null;

    if (!row.is_trusted) {
        status = 'DENIED';
        message = 'Smartphone is not trusted';
    } else if (!row.is_active) {
        status = 'DENIED';
        message = 'Employee is inactive';
    } else if (!isCurrentTimeInAccessWindow(row.access_start_time, row.access_end_time)) {
        status = 'DENIED';
        message = 'Access outside allowed interval';
    }

    await createSeedValidationEvent({
        employeeId: row.employee_id,
        smartphoneId: row.smartphone_id,
        eventType,
        eventStatus: status,
        gateCode,
        notes: message || 'Access seed validated'
    });

    if (status === 'DENIED') {
        return {
            success: false,
            status,
            message
        };
    }

    return {
        success: true,
        status,
        employee: {
            employeeId: row.employee_id,
            firstName: row.first_name,
            lastName: row.last_name,
            carNumber: row.car_number
        }
    };
};

const getAccessEvents = async (filters, user) => {
    const params = [];
    const conditions = [];

    if (filters.employeeId) {
        params.push(filters.employeeId);
        conditions.push(`ae.employee_id = $${params.length}`);
    }

    if (filters.divisionId) {
        params.push(filters.divisionId);
        conditions.push(`e.division_id = $${params.length}`);
    }

    if (filters.eventType) {
        params.push(filters.eventType);
        conditions.push(`ae.event_type = $${params.length}`);
    }

    if (filters.from) {
        params.push(filters.from);
        conditions.push(`ae.event_time >= $${params.length}`);
    }

    if (filters.to) {
        params.push(filters.to);
        conditions.push(`ae.event_time <= $${params.length}`);
    }

    if (user && user.role !== ROLES.ADMIN && user.role !== ROLES.HR) {
        params.push(user.divisionId);
        conditions.push(`e.division_id = $${params.length}`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await query(
        `SELECT ae.*
         FROM access_events ae
         INNER JOIN employees e ON e.employee_id = ae.employee_id
         ${whereClause}
         ORDER BY ae.event_time DESC
         LIMIT 500`,
        params
    );

    return result.rows.map(toEventResponse);
};

const escapeCsvValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue = value instanceof Date ? value.toISOString() : String(value);

    if (/[",\n\r]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
    }

    return stringValue;
};

const getAccessEventsCsv = async (filters, user) => {
    const events = await getAccessEvents(filters, user);
    const columns = [
        'eventId',
        'employeeId',
        'smartphoneId',
        'eventType',
        'eventStatus',
        'eventTime',
        'gateCode',
        'source',
        'notes'
    ];

    const rows = events.map((event) => columns.map((column) => escapeCsvValue(event[column])).join(','));

    return [columns.join(','), ...rows].join('\n');
};

const getEventsForEmployee = async (employeeId, user) => {
    const scope = getAccessScope(user, 2);
    const result = await query(
        `SELECT ae.*
         FROM access_events ae
         INNER JOIN employees e ON e.employee_id = ae.employee_id
         WHERE ae.employee_id = $1${scope.clause}
         ORDER BY ae.event_time DESC`,
        [employeeId, ...scope.params]
    );

    return result.rows.map(toEventResponse);
};

module.exports = {
    createAccessEvent,
    validateAccessSeed,
    getAccessEvents,
    getAccessEventsCsv,
    getEventsForEmployee
};
