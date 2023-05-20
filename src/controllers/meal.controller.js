//const database = require('../util/inmemory')
const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
const jwt = require('jsonwebtoken');

const DATE_FORMATER = require("dateformat");

const mealController = {
    getMeals: function (req, res, next) {

        pool.getConnection(function (err, conn) {
            // Do something with the connection

            if (err) {
                console.log("Error");
            }
            if (conn) {
                conn.query(
                    'SELECT * FROM meal',
                    function (err, results, fields) {
                        if (err) {
                            next({
                                code: 409,
                                message: err.message
                            });
                        }
                        res.status(200).json({
                            status: 200,
                            message: 'Meal GetAll endpoint',
                            data: results,
                        })
                    }
                );
                pool.releaseConnection(conn);
            }
        });

    },
    createMeal: function (req, res, next) {
        console.log('Creating a meal');

        let dateTime = DATE_FORMATER(new Date(), "yyyy-mm-dd HH:MM:ss");

        const newMeal =  { isActive, isVega, isVegan, isToTakeHome, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes, dateTime } = { ...req.body, cookId: req.userId };
        try {
            console.log('Validating input data');
            assert(typeof isActive === 'number', 'isActive must be a number');
            assert(typeof isVega === 'number', 'isVega must be a number');
            assert(typeof isVegan === 'number', 'isVegan must be a number');
            assert(typeof isToTakeHome === 'number', 'isToTakeHome must be a number');
            //assert(typeof dateTime === 'string', 'dateTime must be a string');
            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
            assert(typeof price === 'string', 'price must be a string');
            assert(typeof imageUrl === 'string', 'imageUrl must be a string');
            assert(typeof cookId === 'number', 'cookId must be a number');
            //assert(typeof createDate === 'string', 'createDate must be a string');
            //assert(typeof updateDate === 'string', 'updateDate must be a string');
            assert(typeof name === 'string', 'name must be a string');
            assert(typeof description === 'string', 'description must be a string');
            assert(typeof allergenes === 'string', 'allergenes must be a string');

            pool.getConnection(function (err, conn) {
                if (err) {
                    console.log('Error: Failed to establish a database connection');
                    next({
                        status: 500,
                        message: 'Internal Server Error'
                    });
                }

                if (conn) {
                    console.log('Executing database query');
                    //const queryCreate = 'INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, allergenes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    let sqlInsertStatement = "INSERT INTO meal SET ?";
                    
                    conn.query(sqlInsertStatement, newMeal, function (err, results, fields) {
                        if (err) {
                            if (err.code === 'ER_DUP_ENTRY') {
                                console.log('Error: Duplicate entry');
                                res.status(403).json({
                                    status: 403,
                                    message: 'Meal already exists.',
                                    data: {}
                                });
                            } else {
                                console.log('Error: Failed to execute insert query', err);
                                next({
                                    status: 500,
                                    message: 'Internal Server Error'
                                });
                            }
                        } else {
                            const newMealId = results.insertId;
                            console.log('Meal created successfully');
                            res.status(201).json({
                                status: 201,
                                message: `Meal with ID ${newMealId} has been added`,
                                data: {
                                    id: newMealId,
                                    isActive,
                                    isVega,
                                    isVegan,
                                    isToTakeHome,
                                    dateTime,
                                    maxAmountOfParticipants,
                                    price,
                                    imageUrl,
                                    cookId,
                                    //createDate,
                                    //updateDate,
                                    name,
                                    description,
                                    allergenes
                                }
                            });
                        }
                        pool.releaseConnection(conn);
                    });
                }
            });
        } catch (err) {
            console.log('Error: Validation failed', err);
            res.status(400).json({
                status: 400,
                message: err.toString(),
                data: {},
            });
        }
    },
    getMealWithId: function (req, res, next) {
        //     const mealId = parseInt(req.params.mealId);
        //     //const userId = req.params.userId;

        //     try {
        //         pool.getConnection(function (err, conn) {
        //             if (err) {
        //                 console.log("Error: Failed to establish a database connection");
        //                 next({
        //                     code: 500,
        //                     message: "Internal Server Error"
        //                 });
        //             }

        //             if (conn) {
        //                 pool.query('SELECT * FROM meal WHERE id = ?', [mealId], (err, results) => {
        //                     if (err) {
        //                         console.log("Error retrieving meal");
        //                         next({
        //                             code: 500,
        //                             message: "Internal Server Error"
        //                         });
        //                     } else if (results.length === 0) {
        //                         console.log("Meal not found");
        //                         res.status(404).json({
        //                             status: 404,
        //                             message: `Meal met ID ${mealId} niet gevonden`,
        //                             data: {},
        //                         });
        //                     } else {
        //                         const meal = results[0];

        //                         res.status(200).json({
        //                             status: 200,
        //                             message: `Meal met ID ${mealId} is gevonden`,
        //                             data: meal,
        //                         });
        //                     } pool.releaseConnection(conn);
        //                 });
        //             }
        //         });
        //     } catch (err) {
        //         res.status(400).json({
        //             status: 400,
        //             message: err.toString(),
        //             data: {},
        //         })
        //     }
        // },
        console.log(req.params);
        const mealId = parseInt(req.params.mealId);

        if (isNaN(mealId)) {
            res.status(400).json({
                status: 400,
                message: 'Invalid mealId',
                data: {}
            });
            return;
        }

        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error', err);
                return next('error: ' + err.message);
            }

            // Rest of the code remains unchanged...
            if (conn) {
                conn.query(`SELECT * FROM \`meal\` WHERE \`id\`=${mealId}`, function (err, results, fields) {
                    if (err) {
                        console.log('error', err);
                        res.status(500).json({
                            status: 500,
                            message: 'Internal Server Error',
                            data: {}
                        });
                    } else {
                        if (results.length === 1) {
                            res.status(200).json({
                                status: 200,
                                message: `Meal with ID ${mealId} found`,
                                data: results[0],
                            });
                        } else {
                            res.status(404).json({
                                status: 404,
                                message: `Meal with ID ${mealId} not found`,
                                data: {}
                            });
                        }
                    }

                    conn.release();
                });
            } else {
                res.status(500).json({
                    status: 500,
                    message: 'Internal Server Error',
                    data: {}
                });
            }
        });
    },
    mealUpdate: function (req, res, next) {
        //const { userId } = req.params;
        const mealId = parseInt(req.params.mealId);
        const { isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, updateDate, name, description, allergenes } = { ...req.body, cookId: req.user.id };
        try {

            assert(typeof isActive === 'integer', 'isActive must be a integer');
            assert(typeof isVega === 'integer', 'isVega must be a integer');
            assert(typeof isVegan === 'integer', 'isVegan must be a integer');
            assert(typeof isToTakeHome === 'integer', 'isToTakeHome must be a integer');
            assert(typeof dateTime === 'string', 'dateTime must be a string');
            assert(typeof maxAmountOfParticipants === 'integer', 'maxAmountOfParticipants must be a integer');
            assert(typeof price === 'string', 'price must be a string');
            assert(typeof imageUrl === 'string', 'imageUrl must be a string');
            assert(typeof cookId === 'integer', 'cookId must be a integer');
            assert(typeof createDate === 'string', 'createDate must be a string');
            assert(typeof updateDate === 'string', 'updateDate must be a string');
            assert(typeof name === 'string', 'name must be a string');
            assert(typeof description === 'string', 'name must be a string');
            assert(typeof allergenes === 'string', 'allergenes must be a string');

            pool.getConnection(function (err, conn) {
                if (err) {
                    console.log("Error: Failed to establish a database connection");
                    next({
                        code: 500,
                        message: "Internal Server Error"
                    });
                }

                if (conn) {
                    pool.query('SELECT * FROM meal WHERE id = ?', [mealId], (err, results) => {
                        if (err) {
                            console.log("Error retrieving meal");
                            next({
                                code: 500,
                                message: "Internal Server Error"
                            });
                        } else if (results.length === 0) {
                            console.log("Meal not found");
                            res.status(404).json({
                                status: 404,
                                message: `Meal with ID ${mealId} not found`,
                                data: {},
                            });
                        } else if (results.length === 1) {
                            const meal = results[0];
                            meal.isActive = isActive || meal.isActive;
                            meal.isVega = isVega || meal.isVega;
                            meal.isVegan = isVegan || meal.isVegan;
                            meal.isToTakeHome = isToTakeHome || meal.isToTakeHome;
                            meal.dateTime = dateTime || meal.dateTime;
                            meal.maxAmountOfParticipants = maxAmountOfParticipants || meal.maxAmountOfParticipants;
                            meal.price = price || meal.price;
                            meal.imageUrl = imageUrl || meal.imageUrl;
                            meal.cookId = cookId || meal.cookId;
                            meal.createDate = createDate || meal.createDate;
                            meal.updateDate = updateDate || meal.updateDate;
                            meal.name = name || meal.name;
                            meal.description = description || meal.description;
                            meal.allergenes = allergenes || meal.allergenes;


                            const query = 'UPDATE meal SET isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = ?, maxAmountOfParticipants = ?, price = ?, imageUrl = ?, cookId = ?, createDate = ?, updateDate = ?, name = ?, description = ?, allergenes = ? WHERE id = ?';
                            conn.query(query, [meal.isActive, meal.isVega, meal.isVegan, meal.isToTakeHome, meal.dateTime, meal.maxAmountOfParticipants, meal.price, meal.imageUrl, meal.cookId, meal.createDate, meal.updateDate, meal.name, meal.description, meal.allergenes, mealId], function (err, results, fields) {
                                console.log('Executing update query');
                                if (err) {
                                    console.log("Error updating meal:", err);
                                    next({
                                        code: 500,
                                        message: "Internal Server Error"
                                    });
                                } else {
                                    console.log("Meal updated successfully");
                                    res.status(200).json({
                                        status: 200,
                                        message: "Meal updated successfully",
                                        data: meal,
                                    });
                                }
                                pool.releaseConnection(conn);
                            });
                        }
                    });
                }
            });
        } catch (err) {
            res.status(400).json({
                status: 400,
                message: err.toString(),
                data: {},
            });
        }
    },
    mealDelete: function (req, res, next) {
        //     const mealId = parseInt(req.params.mealId);
        //     //const { userId } = req.params;
        //     try {
        //         pool.getConnection(function (err, conn) {
        //             if (err) {
        //                 console.log("Error: Failed to establish a database connection");
        //                 next({
        //                     code: 500,
        //                     message: "Can't connect"
        //                 });
        //             }
        //             if (conn) {
        //                 pool.query('SELECT * FROM meal WHERE id = ?', [mealId], (err, results) => {
        //                     if (err) {
        //                         console.log("Error retrieving meal", err);
        //                         next({
        //                             code: 500,
        //                             message: "Can't query select"
        //                         });
        //                     } else if (results.length === 0) {
        //                         console.log("Meal not found");
        //                         res.status(404).json({
        //                             status: 404,
        //                             message: `Meal met ID ${mealId} niet gevonden`,
        //                             data: {},
        //                         });
        //                     } else if (results.length === 1) {
        //                         conn.query('DELETE FROM meal WHERE id = ?', [mealId], (err) => {
        //                             if (err) {
        //                                 console.log("Error deleting meal", err);
        //                                 next({
        //                                     code: 500,
        //                                     message: "Can't query delete"
        //                                 });
        //                             } else {
        //                                 // Meal deleted successfully
        //                                 res.status(200).json({
        //                                     status: 200,
        //                                     message: "Meal deleted successfully",
        //                                     data: {},
        //                                 });
        //                             }
        //                             pool.releaseConnection(conn);
        //                         });
        //                     }
        //                 });
        //             }
        //         });
        //     } catch (err) {
        //         res.status(400).json({
        //             status: 400,
        //             message: err.toString(),
        //             data: {},
        //         });
        //     }
        // } const mealId = parseInt(req.params.mealid);
        const mealId = parseInt(req.params.mealId);
        //SELECT MEAL SQL
        const selectMealSql = `SELECT cookId FROM \`meal\` WHERE \`id\` = ${mealId}`;
        //CONNECTION
        pool.getConnection(function (err, conn) {
            if (err) {
                console.log('error', err);
                next('error: ' + err.message);
                return;
            }
            if (conn) {
                conn.query(selectMealSql, function (err, results, fields) {
                    if (err) {
                        next({
                            status: 500,
                            message: err.message,
                        });
                        return;
                    }
                    if (results.length === 0) {
                        res.status(404).json({
                            status: 404,
                            message: `Meal with id ${mealId} not found`,
                            data: {}
                        });
                        return;
                    }

                    const cookId = results[0].cookId;

                    // VERIFY OWNER
                    if (cookId != req.userId) {
                        res.status(403).json({
                            status: 403,
                            message: "User is not the owner of this data",
                            data: {}
                        });
                        return;
                    }

                    //DELETE MEAL SQL
                    const deleteMealSql = `DELETE FROM \`meal\` WHERE \`id\` = ${mealId}`;

                    conn.query(deleteMealSql, function (err, results, fields) {
                        if (err) {
                            next({
                                status: 500,
                                message: err.message,
                            });
                            return;
                        }
                        res.status(200).json({
                            status: 200,
                            message: `Meal with id ${mealId} has been deleted`,
                            data: {}
                        });
                        conn.release();
                    });
                });
            }
        });
    }
};

module.exports = mealController