const DivisionModel = {
    table: 'divisions',
    primaryKey: 'division_id',
    columns: {
        divisionId: 'SERIAL PRIMARY KEY',
        name: 'VARCHAR(100) NOT NULL UNIQUE',
        createdAt: 'TIMESTAMPTZ NOT NULL DEFAULT NOW()'
    }
};

module.exports = DivisionModel;
