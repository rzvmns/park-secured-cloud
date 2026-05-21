const express = require('express');
const {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    toggleEmployeeAccess
} = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES, EMPLOYEE_WRITE_ROLES, READ_ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/employees', authenticate, authorize(...READ_ROLES), getEmployees);
router.get('/employees/:id', authenticate, authorize(...READ_ROLES), getEmployeeById);
router.post('/employees', authenticate, authorize(ROLES.ADMIN, ROLES.HR), createEmployee);
router.put('/employees/:id', authenticate, authorize(...EMPLOYEE_WRITE_ROLES), updateEmployee);
router.patch('/employees/:id/toggle-access', authenticate, authorize(...EMPLOYEE_WRITE_ROLES), toggleEmployeeAccess);

module.exports = router;
