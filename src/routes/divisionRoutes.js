const express = require('express');
const { getDivisions, createDivision } = require('../controllers/divisionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/divisions', authenticate, authorize(ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR, ROLES.VIEWER), getDivisions);
router.post('/divisions', authenticate, authorize(ROLES.ADMIN), createDivision);

module.exports = router;
