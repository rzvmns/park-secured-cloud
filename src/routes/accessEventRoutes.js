const express = require('express');
const { createAccessEvent, getAccessEvents } = require('../controllers/accessEventController');
const { authenticate, authenticateGateOrUser, authorize } = require('../middlewares/authMiddleware');
const { ROLES, READ_ROLES } = require('../utils/roles');

const router = express.Router();

router.post('/access-events', authenticateGateOrUser, createAccessEvent);
router.get('/access-events', authenticate, authorize(...READ_ROLES), getAccessEvents);

module.exports = router;
