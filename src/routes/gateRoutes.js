const express = require('express');
const { getGateAccessList, getGateStatus } = require('../controllers/gateController');
const { authenticate, authenticateGate, authorize } = require('../middlewares/authMiddleware');
const { READ_ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/gate/access-list', authenticateGate, getGateAccessList);
router.get('/gate/status', authenticate, authorize(...READ_ROLES), getGateStatus);

module.exports = router;
