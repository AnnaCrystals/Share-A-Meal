const assert = require('assert');
const jwt = require('jsonwebtoken');
const pool = require('../util/mysql-db');
const { logger, jwtSecretKey } = require('../util/utils');

module.exports = {
    login(req, res, next) {
        console.log(req.body);
        const { emailAdress, password } = req.body;
        if (!emailAdress || !password) {
            next({
                code: 400,
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
                    'SELECT * FROM user WHERE emailAdress = ?',
                    [emailAdress],
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
                                const payload = { id: results[0].id }; 

                                jwt.sign(
                                    payload,
                                    jwtSecretKey,
                                    { expiresIn: '1d' },
                                    (err, token) => {
                                        if (err) {
                                            next({
                                                status: 500,
                                                message: 'Error generating token',
                                            });
                                        } else {
                                            console.log('Generated Token - Payload:', payload); 
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
                                    message: 'Email adress and password do not match',
                                });
                            }
                        } else {
                            next({
                                code: 404,
                                message: `User with emailAdress ${emailAdress} cannot be found`,
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
                typeof req.body.email === 'string',
                'emailAdress must be a string.'
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

            console.log('Token Payload:', decoded); 
            req.userId = decoded.id; 
            next();
        });
    },

    validateEmail(req, res, next) {

        const emailRegex = /^[a-z]\.[a-z]+@avans\.nl$/;
        const isValidEmail = emailRegex.test(req.body.emailAdress);

        if (!isValidEmail) {
            return res.status(400).json({
                error: 'Invalid email adress.',
                datetime: new Date().toISOString(),
            });
        }

        next();
    },

    validatePassword(req, res, next) {
        const password = req.body.password;

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        const isValidPassword = passwordRegex.test(password);

        if (!isValidPassword) {
            return res.status(400).json({
                error: 'Invalid password. Password should be at least 8 characters long, contain at least 1 number, and at least 1 uppercase letter.',
                datetime: new Date().toISOString(),
            });
        }

        next();
    },
};