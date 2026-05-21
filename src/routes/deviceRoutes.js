const express = require('express');
const { registerDevice, getDeviceByEmployeeId } = require('../controllers/deviceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { READ_ROLES, WRITE_ROLES } = require('../utils/roles');

const router = express.Router();

router.post('/devices/register', authenticate, authorize(...WRITE_ROLES), registerDevice);
router.get('/devices/:employeeId', authenticate, authorize(...READ_ROLES), getDeviceByEmployeeId);

module.exports = router;
