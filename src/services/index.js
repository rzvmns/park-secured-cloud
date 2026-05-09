const employeeService = require('./employeeService');
const accessEventService = require('./accessEventService');
const authService = require('./authService');
const userService = require('./userService');
const deviceService = require('./deviceService');
const divisionService = require('./divisionService');
const reportService = require('./reportService');

module.exports = {
    authService,
    userService,
    divisionService,
    employeeService,
    deviceService,
    accessEventService,
    reportService
};
