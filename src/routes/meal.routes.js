const express = require('express')
const router = express.Router()
router.use(express.json());
const mealController = require('../controllers/meal.controller')
const authenticationController = require('../controllers/authentication.controller')
//const database = require('../util/inmemory')

//UC-301 Toevoegen van maaltijden
//token
router.post('/', authenticationController.validateToken, mealController.createMeal)

//UC-302 Wijzigen van maaltijdgegevens
//token + eigenaar van maaltijd
router.put('/:mealId', authenticationController.validateToken, mealController.mealUpdate)

//UC-303 Opvragen van alle maaltijden
router.get('/', mealController.getMeals)

//UC-304 Opvragen van maaltijd bij ID
router.get('/:mealId', mealController.getMealWithId)

//UC-305 Verwijderen van maaltijd
//token + eigenaar van maaltijd
router.delete('/:mealId', authenticationController.validateToken, mealController.mealDelete)

module.exports = router
