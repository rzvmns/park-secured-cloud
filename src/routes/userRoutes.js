const express = require('express');
const { getUsers, createUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { ROLES } = require('../utils/roles');

const router = express.Router();

router.get('/users', authenticate, authorize(ROLES.ADMIN), getUsers);
router.post('/users', authenticate, authorize(ROLES.ADMIN), createUser);

module.exports = router;
