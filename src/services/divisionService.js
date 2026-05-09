const { query } = require('../config/db');

const toDivisionResponse = (division) => ({
    divisionId: division.division_id,
    name: division.name,
    createdAt: division.created_at
});

const getDivisions = async () => {
    const result = await query(
        `SELECT division_id, name, created_at
         FROM divisions
         ORDER BY name ASC`
    );

    return result.rows.map(toDivisionResponse);
};

const createDivision = async ({ name }) => {
    const result = await query(
        `INSERT INTO divisions (name)
         VALUES ($1)
         RETURNING division_id, name, created_at`,
        [name]
    );

    return toDivisionResponse(result.rows[0]);
};

module.exports = {
    getDivisions,
    createDivision
};
