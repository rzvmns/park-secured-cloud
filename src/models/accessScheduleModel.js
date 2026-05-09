const AccessScheduleModel = {
    table: 'employees',
    primaryKey: 'employee_id',
    columns: {
        employeeId: 'SERIAL PRIMARY KEY',
        accessStartTime: 'TIME NULL',
        accessEndTime: 'TIME NULL',
        isActive: 'BOOLEAN NOT NULL DEFAULT TRUE'
    },
    relations: {
        employee: 'access interval is stored directly on employees'
    }
};

module.exports = AccessScheduleModel;
