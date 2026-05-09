const express = require('express');
const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    toggleEmployeeAccess
} = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES, WRITE_ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/employees', authenticate, authorize(ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR, ROLES.VIEWER), getEmployees);
router.get('/employees/:id', authenticate, authorize(ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR, ROLES.VIEWER), getEmployeeById);
router.post('/employees', authenticate, authorize(...WRITE_ROLES), createEmployee);
router.put('/employees/:id', authenticate, authorize(...WRITE_ROLES), updateEmployee);
router.patch('/employees/:id/toggle-access', authenticate, authorize(...WRITE_ROLES), toggleEmployeeAccess);

module.exports = router;
