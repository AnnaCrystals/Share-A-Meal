//
// Authentication controller
//
const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const { logger, jwtSecretKey } = require('../util/utils');

module.exports = {
    login(req, res, next) {
        console.log(req.body);
        const { emailAddress, password } = req.body;
        if (!emailAddress || !password) {
            next({
                code: 404,
                message: 'Verplicht veld ontbreekt',
            });
            return;
        }

        pool.getConnection((err, conn) => {
            if (err) {
                next({
                    code: 500,
                    message: err.code,
                });
                return;
            }

            if (conn) {
                conn.query(
                    'SELECT * FROM user WHERE emailAddress = ?',
                    [emailAddress],
                    function (err, results, fields) {
                        if (err) {
                            next({
                                code: 400,
                                message: err.message,
                            });
                            return;
                        }

                        if (results[0]) {
                            if (results[0].password === password) {
                                const payload = { id: results[0].id }; // Update this line

                                jwt.sign(
                                    payload,
                                    jwtSecretKey,
                                    { expiresIn: '1d' },
                                    (err, token) => {
                                        if (err) {
                                            next({
                                                code: 500,
                                                message: 'Error generating token',
                                            });
                                        } else {
                                            console.log('Generated Token - Payload:', payload); // Update this line
                                            res.status(200).json({
                                                code: 200,
                                                message: 'User has logged in',
                                                data: { ...results[0], token },
                                            });
                                        }
                                    }
                                );
                            } else {
                                next({
                                    code: 400,
                                    message: 'Email address and password do not match',
                                });
                            }
                        } else {
                            next({
                                code: 404,
                                message: `User with emailAddress ${emailAddress} cannot be found`,
                            });
                        }
                    }
                );
            }
        });
    },
    validateLogin(req, res, next) {
        try {
            assert(
                typeof req.body.emailAddress === 'string',
                'emailAddress must be a string.'
            );
            assert(
                typeof req.body.password === 'string',
                'password must be a string.'
            );
            next();
        } catch (ex) {
            res.status(422).json({
                error: ex.toString(),
                datetime: new Date().toISOString(),
            });
        }
    },
    validateToken(req, res, next) {
        const header = req.headers.authorization;
        if (!header) {
            return res.status(401).json({
                status: 401,
                message: 'Invalid token',
                data: {}
            });
        }
        const token = req.headers.authorization.split(' ')[1];

        jwt.verify(token, jwtSecretKey, (err, decoded) => {
            if (err) {
                next({
                    status: 401,
                    message: 'Invalid token',
                });
                return;
            }

            console.log('Token Payload:', decoded); // Add this line
            req.userId = decoded.id; // Update this line
            next();
        });
    },
};