const express = require('express');
const { registerDevice, getDeviceByEmployeeId } = require('../controllers/deviceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES, WRITE_ROLES } = require('../utils/roles');

const router = express.Router();

router.post('/devices/register', authenticate, authorize(...WRITE_ROLES), registerDevice);
router.get('/devices/:employeeId', authenticate, authorize(ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR, ROLES.VIEWER), getDeviceByEmployeeId);

module.exports = router;
