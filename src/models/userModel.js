const UserModel = {
    table: 'users',
    primaryKey: 'user_id',
    columns: {
        userId: 'SERIAL PRIMARY KEY',
        email: 'VARCHAR(255) NOT NULL UNIQUE',
        passwordHash: 'VARCHAR(255) NOT NULL',
        role: "VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'hr', 'division_manager', 'operator', 'viewer'))",
        divisionId: 'INTEGER REFERENCES divisions(division_id)',
        isActive: 'BOOLEAN NOT NULL DEFAULT TRUE',
        createdAt: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
    },
    relations: {
        division: 'users.division_id -> divisions.division_id'
    }
};

module.exports = UserModel;
