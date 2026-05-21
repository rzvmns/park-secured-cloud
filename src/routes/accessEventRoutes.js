const express = require('express');
const {
    createAccessEvent,
    getAccessEvents,
    exportAccessEventsCsv,
    validateAccessSeed
} = require('../controllers/accessEventController');
const { authenticate, authenticateGate, authenticateGateOrUser, authorize } = require('../middlewares/authMiddleware');
const { READ_ROLES } = require('../utils/roles');

const router = express.Router();

router.post('/access-events', authenticateGateOrUser, createAccessEvent);
router.get('/access-events/export.csv', authenticate, authorize(...READ_ROLES), exportAccessEventsCsv);
router.get('/access-events', authenticate, authorize(...READ_ROLES), getAccessEvents);
router.post('/access/validate-seed', authenticateGate, validateAccessSeed);

module.exports = router;
