const express = require('express')
const router = express.Router()
const controller = require('../controllers/info.controller')

//UC-201 Registreren als nieuwe user
router.get('', controller.getInfo)


module.exports = router