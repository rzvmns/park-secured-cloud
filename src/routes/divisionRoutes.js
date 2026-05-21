const express = require('express');
const { getDivisions, createDivision } = require('../controllers/divisionController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES, READ_ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/divisions', authenticate, authorize(...READ_ROLES), getDivisions);
router.post('/divisions', authenticate, authorize(ROLES.ADMIN), createDivision);

module.exports = router;
