const employeeService = require('./employeeService');
const accessEventService = require('./accessEventService');
const authService = require('./authService');
const userService = require('./userService');
const deviceService = require('./deviceService');
const divisionService = require('./divisionService');
const gateService = require('./gateService');
const reportService = require('./reportService');

module.exports = {
    authService,
    userService,
    divisionService,
    employeeService,
    deviceService,
    accessEventService,
    gateService,
    reportService
};
