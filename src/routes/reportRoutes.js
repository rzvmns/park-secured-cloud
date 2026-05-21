const express = require('express');
const {
    getIndividualReport,
    getDivisionReport,
    getGlobalReport
} = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { READ_ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/reports/individual/:employeeId', authenticate, authorize(...READ_ROLES), getIndividualReport);
router.get('/reports/division/:divisionId', authenticate, authorize(...READ_ROLES), getDivisionReport);
router.get('/reports/global', authenticate, authorize(...READ_ROLES), getGlobalReport);

module.exports = router;
