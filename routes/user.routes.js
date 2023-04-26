const express = require('express')
const router = express.Router()
const controller = require('../controllers/user.controller')
const database = require('../util/inmemory')

//UC-201 Registreren als nieuwe user
router.post('', controller.createUser)

//UC-202 Opvragen van overzicht van users
router.get('', controller.getUsers)

//UC-203 Opvragen van gebruikersprofiel
router.get('/profile', controller.getUserProfile)

//UC-204 Opvragen van usergegevens bij ID
router.get('/:userId', controller.getUserWithId)

//UC-205 Wijzigen van usergegeven
router.put('/:userId', controller.userUpdate)

//UC-206 Verwijderen van user
router.delete('/:userId', controller.userDelete)

module.exports = router