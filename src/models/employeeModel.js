const EmployeeModel = {
    table: 'employees',
    primaryKey: 'employee_id',
    columns: {
        employeeId: 'SERIAL PRIMARY KEY',
        firstName: 'VARCHAR(100) NOT NULL',
        lastName: 'VARCHAR(100) NOT NULL',
        cnp: 'VARCHAR(20) NOT NULL UNIQUE',
        photoUrl: 'TEXT NULL',
        badgeCode: 'VARCHAR(50) UNIQUE',
        divisionId: 'INTEGER NOT NULL REFERENCES divisions(division_id)',
        bluetoothCode: 'VARCHAR(100) UNIQUE',
        carNumber: 'VARCHAR(30) NULL',
        accessStartTime: 'TIME NULL',
        accessEndTime: 'TIME NULL',
        isActive: 'BOOLEAN NOT NULL DEFAULT TRUE',
        grantedByAccountId: 'INTEGER REFERENCES accounts(account_id)',
        createdAt: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()',
        updatedAt: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
    },
    relations: {
        division: 'employees.division_id -> divisions.division_id',
        grantedBy: 'employees.granted_by_account_id -> accounts.account_id'
    }
};

module.exports = EmployeeModel;
