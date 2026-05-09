const SmartphoneModel = {
    table: 'smartphones',
    primaryKey: 'smartphone_id',
    columns: {
        smartphoneId: 'SERIAL PRIMARY KEY',
        employeeId: 'INTEGER NOT NULL UNIQUE REFERENCES employees(employee_id)',
        platform: 'VARCHAR(20) NOT NULL',
        deviceIdentifier: 'VARCHAR(255) NOT NULL UNIQUE',
        isTrusted: 'BOOLEAN NOT NULL DEFAULT TRUE',
        registeredAt: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
    },
    relations: {
        employee: 'smartphones.employee_id -> employees.employee_id'
    }
};

module.exports = SmartphoneModel;
