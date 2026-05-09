const accessEventQueries = {
    create: `
    INSERT INTO AccessEvents (employeeId, smartphoneId, eventType, eventStatus, eventTime, gateCode, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING eventId;
  `,
    getEmployeeReport: `
    SELECT eventId, employeeId, smartphoneId, eventType, eventStatus, eventTime, gateCode, notes
    FROM AccessEvents
    WHERE employeeId = $1
    ORDER BY eventTime DESC;
  `
};

module.exports = accessEventQueries;
