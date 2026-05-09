const express = require('express');
const { createAccessEvent, getAccessEvents } = require('../controllers/accessEventController');
const { authenticate, authenticateGateOrUser, authorize } = require('../middlewares/authMiddleware');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.post('/access-events', authenticateGateOrUser, createAccessEvent);
router.get('/access-events', authenticate, authorize(ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR, ROLES.VIEWER), getAccessEvents);

module.exports = router;
