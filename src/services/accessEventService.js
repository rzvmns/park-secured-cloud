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
    if (!user || user.role === ROLES.ADMIN) {
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

    if (user && user.role !== ROLES.ADMIN) {
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
    getAccessEvents,
    getEventsForEmployee
};
