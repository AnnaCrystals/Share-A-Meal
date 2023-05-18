const express = require('express')
const router = express.Router()
router.use(express.json());
const userController = require('../controllers/user.controller')
const authenticationController = require('../controllers/authentication.controller')
//const database = require('../util/inmemory')

//UC-201 Registreren als nieuwe user
router.post('', userController.createUser)

//UC-202 Opvragen van overzicht van users
router.get('', userController.getUsers)

//UC-203 Opvragen van gebruikersprofiel
router.get('/profile', authenticationController.validateToken, userController.getUserProfile)

//UC-204 Opvragen van usergegevens bij ID
router.get('/:userId', userController.getUserWithId)

//UC-205 Wijzigen van usergegeven
router.put('/:userId', authenticationController.validateToken, userController.userUpdate)

//UC-206 Verwijderen van user
router.delete('/:userId', authenticationController.validateToken, userController.userDelete)

module.exports = router
