const AccountModel = {
    table: 'accounts',
    primaryKey: 'account_id',
    columns: {
        accountId: 'SERIAL PRIMARY KEY',
        email: 'VARCHAR(255) NOT NULL UNIQUE',
        passwordHash: 'VARCHAR(255) NOT NULL',
        role: "VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'hr', 'division_manager', 'operator', 'viewer'))",
        divisionId: 'INTEGER REFERENCES divisions(division_id)',
        employeeId: 'INTEGER UNIQUE REFERENCES employees(employee_id) ON DELETE SET NULL',
        isActive: 'BOOLEAN NOT NULL DEFAULT TRUE',
        createdAt: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
    },
    relations: {
        division: 'accounts.division_id -> divisions.division_id',
        employee: 'accounts.employee_id -> employees.employee_id'
    }
};

module.exports = AccountModel;
