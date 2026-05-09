const smartphoneQueries = {
    getByEmployeeId: `
    SELECT smartphoneId, employeeId, platform, deviceIdentifier, isTrusted, registeredAt
    FROM Smartphones
    WHERE employeeId = $1;
  `
};

module.exports = smartphoneQueries;
