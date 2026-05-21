const express = require('express');
const { createAccessEvent, getAccessEvents, validateAccessSeed } = require('../controllers/accessEventController');
const { authenticate, authenticateGate, authenticateGateOrUser, authorize } = require('../middlewares/authMiddleware');
const { READ_ROLES } = require('../utils/roles');

const router = express.Router();

router.post('/access-events', authenticateGateOrUser, createAccessEvent);
router.get('/access-events', authenticate, authorize(...READ_ROLES), getAccessEvents);
router.post('/access/validate-seed', authenticateGate, validateAccessSeed);

module.exports = router;
