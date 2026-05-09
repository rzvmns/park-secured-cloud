const express = require('express');
const { testDatabaseConnection } = require('../controllers/testController');

const router = express.Router();

router.get('/db-test', testDatabaseConnection);

module.exports = router;
