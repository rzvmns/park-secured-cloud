const express = require('express');
const { getGateAccessList } = require('../controllers/gateController');
const { authenticateGate } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/gate/access-list', authenticateGate, getGateAccessList);

module.exports = router;
