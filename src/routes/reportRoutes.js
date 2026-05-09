const express = require('express');
const {
    getIndividualReport,
    getDivisionReport,
    getGlobalReport
} = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/reports/individual/:employeeId', authenticate, authorize(ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR, ROLES.VIEWER), getIndividualReport);
router.get('/reports/division/:divisionId', authenticate, authorize(ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR, ROLES.VIEWER), getDivisionReport);
router.get('/reports/global', authenticate, authorize(ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR, ROLES.VIEWER), getGlobalReport);

module.exports = router;
