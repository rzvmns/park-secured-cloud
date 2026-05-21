const express = require('express');
const { loginSecure, validateAccess } = require('../controllers/mobileController');

const router = express.Router();

router.post('/mobile/login-secure', loginSecure);
router.post('/validate-access', validateAccess);

module.exports = router;
