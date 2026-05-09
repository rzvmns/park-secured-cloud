const divisionQueries = {
    getAll: `
    SELECT divisionId, name, createdAt
    FROM Divisions
    ORDER BY name ASC;
  `
};

module.exports = divisionQueries;
