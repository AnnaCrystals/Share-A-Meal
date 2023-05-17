const express = require('express');
const router = express.Router();
const authController = require('../controllers/authentication.controller')

// UC-101 Inloggen toevoegen

router.post('/login', authController.login)

module.exports = router;
