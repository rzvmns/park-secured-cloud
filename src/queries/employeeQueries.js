const employeeQueries = {
    getAll: `
    SELECT e.employeeId, e.firstName, e.lastName, e.badgeCode, e.isActive,
           d.divisionId, d.name AS divisionName
    FROM Employees e
    INNER JOIN Divisions d ON d.divisionId = e.divisionId
    ORDER BY e.employeeId DESC;
  `,
    getById: `
    SELECT e.employeeId, e.firstName, e.lastName, e.badgeCode, e.isActive,
           d.divisionId, d.name AS divisionName
    FROM Employees e
    INNER JOIN Divisions d ON d.divisionId = e.divisionId
    WHERE e.employeeId = $1;
  `
};

module.exports = employeeQueries;
