const express = require('express');
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authenticate, requireRole } = require('../middlewares/authMiddleware');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/users', authenticate, requireRole(ROLES.ADMIN, ROLES.HR), getUsers);
router.post('/users', authenticate, requireRole(ROLES.ADMIN, ROLES.HR), createUser);
router.put('/users/:id', authenticate, requireRole(ROLES.ADMIN, ROLES.HR), updateUser);
router.delete('/admin/users/:id', authenticate, requireRole(ROLES.ADMIN), deleteUser);

module.exports = router;
