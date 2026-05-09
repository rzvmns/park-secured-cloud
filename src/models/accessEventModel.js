const AccessEventModel = {
    table: 'access_events',
    primaryKey: 'event_id',
    columns: {
        eventId: 'BIGSERIAL PRIMARY KEY',
        employeeId: 'INTEGER NOT NULL REFERENCES employees(employee_id)',
        smartphoneId: 'INTEGER REFERENCES smartphones(smartphone_id)',
        eventType: "VARCHAR(30) NOT NULL CHECK (event_type IN ('ENTRY', 'EXIT'))",
        eventStatus: "VARCHAR(30) NOT NULL CHECK (event_status IN ('ALLOWED', 'DENIED'))",
        eventTime: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
        gateCode: 'VARCHAR(50) NULL',
        source: "VARCHAR(50) NOT NULL DEFAULT 'gate'",
        notes: 'TEXT NULL'
    },
    relations: {
        employee: 'access_events.employee_id -> employees.employee_id',
        smartphone: 'access_events.smartphone_id -> smartphones.smartphone_id'
    }
};

module.exports = AccessEventModel;
