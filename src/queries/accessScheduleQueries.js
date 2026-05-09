const accessScheduleQueries = {
    getByEmployeeId: `
    SELECT scheduleId, employeeId, weekday, startTime, endTime, isActive
    FROM AccessSchedules
    WHERE employeeId = $1
    ORDER BY weekday ASC, startTime ASC;
  `
};

module.exports = accessScheduleQueries;
