//const database = require('../util/inmem-db');
const logger = require('../util/utils').logger;
const assert = require('assert');
const pool = require('../util/mysql-db');
const jwt = require('jsonwebtoken');

// const database = require('../util/inmemory')
// const assert = require('assert')
// const pool = require('../util/mysql-db')

// const database = require('../util/inmemory')
// const assert = require('assert')
// const pool = require('../util/mysql-db')

const userController = {
  getUsers: function (req, res, next) {

    pool.getConnection(function (err, conn) {
      // Do something with the connection

      if (err) {
        console.log("Error");
      }
      if (conn) {
        conn.query(
          'SELECT * FROM user',
          function (err, results, fields) {
            if (err) {
              next({
                code: 409,
                message: err.message
              });
            }
            res.status(200).json({
              status: 200,
              message: 'User GetAll endpoint',
              data: results,
            })
          }
        );
        pool.releaseConnection(conn);
      }
    });

  },

  createUser: function (req, res, next) {
    const { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = req.body;
    try {
      assert(typeof firstName === 'string', 'firstName must be a string');
      assert(typeof lastName === 'string', 'lastName must be a string');
      assert(typeof street === 'string', 'street must be a string');
      assert(typeof city === 'string', 'city must be a string');
      //assert(typeof isActive === 'boolean', 'isActive must be a boolean');
      assert(typeof emailAddress === 'string', 'emailAddress must be a string');
      assert(typeof password === 'string', 'password must be a string');
      assert(typeof phoneNumber === 'string', 'phoneNumber must be a string');

      pool.getConnection(function (err, conn) {
        if (err) {
          console.log("Error: Failed to establish a database connection");
          next({
            code: 500,
            message: "Internal Server Error"
          });
        }

        if (conn) {
          const query = 'INSERT INTO user (firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
          conn.query(query, [firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber], function (err, results, fields) {
            if (err) {
              console.log("Error: Failed to execute insert query", err);
              next({
                code: 500,
                message: "Internal Server Error"
              });
            } else {
              const newUserId = results.insertId;
              console.log("User created successfully");
              res.status(201).json({
                status: 201,
                message: `User with ID ${newUserId} has been added`,
                data: {
                  id: newUserId,
                  firstName,
                  lastName,
                  street,
                  city,
                  isActive,
                  emailAddress,
                  password,
                  phoneNumber
                }
              });
            }
            pool.releaseConnection(conn);
          });
        }
      });
    } catch (err) {
      console.log("Error: Validation failed", err);
      res.status(400).json({
        status: 400,
        message: err.toString(),
        data: {},
      });
    }
  },


  getUserProfile: function (req, res, next) {
    const userId = req.params.userId;
    try {
      pool.getConnection(function (err, conn) {
        if (err) {
          console.log("Error: Failed to establish a database connection");
          next({
            code: 500,
            message: "Internal Server Error"
          });
        }

        if (conn) {
          pool.query('SELECT * FROM user WHERE id = 1', (err, results) => {
            if (err) {
              console.log("Error retrieving user profile");
              next({
                code: 500,
                message: "Internal Server Error"
              });
            }
            else if (results.length === 0) {
              console.log("User not found");
              next({
                code: 404,
                message: "User not found"
              });
            }
            else {
              const user = results[0];

              res.status(200).json({
                status: 200,
                message: "Profiel van user succesvol opgevraagd",
                data: {
                  id: user.id,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  street: user.street,
                  city: user.city,
                  isActive: user.isActive,
                  emailAddress: user.emailAddress,
                  password: user.password,
                  phoneNumber: user.phoneNumber
                }
              });
            } pool.releaseConnection(conn);
          });
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 400,
        message: err.toString(),
        data: {},
      })
    }
  },

  getUserWithId: function (req, res, next) {
    const userId = req.params.userId;

    try {
      pool.getConnection(function (err, conn) {
        if (err) {
          console.log("Error: Failed to establish a database connection");
          next({
            code: 500,
            message: "Internal Server Error"
          });
        }

        if (conn) {
          pool.query('SELECT * FROM user WHERE id = ?', [userId], (err, results) => {
            if (err) {
              console.log("Error retrieving user");
              next({
                code: 500,
                message: "Internal Server Error"
              });
            } else if (results.length === 0) {
              console.log("User not found");
              res.status(404).json({
                status: 404,
                message: `User met ID ${userId} niet gevonden`,
                data: {},
              });
            } else {
              const user = results[0];

              res.status(200).json({
                status: 200,
                message: `User met ID ${userId} is gevonden`,
                data: user,
              });
            } pool.releaseConnection(conn);
          });
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 400,
        message: err.toString(),
        data: {},
      })
    }
  },

  userUpdate: function (req, res, next) {
    const { userId } = req.params;
    const { firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber } = req.body;
    try {

      assert(typeof firstName === 'undefined' || (typeof firstName === 'string'), 'firstName must be a string');
      assert(typeof lastName === 'undefined' || (typeof lastName === 'string'), 'lastName must be a string');
      assert(typeof street === 'undefined' || (typeof street === 'string'), 'street must be a string');
      assert(typeof city === 'undefined' || (typeof city === 'string'), 'city must be a string');
      assert(typeof isActive === 'undefined' || (typeof isActive === 'boolean'), 'isActive must be a boolean');
      assert(typeof emailAddress === 'undefined' || (typeof emailAddress === 'string'), 'emailAddress must be a string');
      assert(typeof password === 'undefined' || (typeof password === 'string'), 'password must be a string');
      assert(typeof phoneNumber === 'undefined' || (typeof phoneNumber === 'string'), 'phoneNumber must be a string');

      pool.getConnection(function (err, conn) {
        if (err) {
          console.log("Error: Failed to establish a database connection");
          next({
            code: 500,
            message: "Internal Server Error"
          });
        }

        if (conn) {
          pool.query('SELECT * FROM user WHERE id = ?', [userId], (err, results) => {
            if (err) {
              console.log("Error retrieving user");
              next({
                code: 500,
                message: "Internal Server Error"
              });
            } else if (results.length === 0) {
              console.log("User not found");
              res.status(404).json({
                status: 404,
                message: `User met ID ${userId} niet gevonden`,
                data: {},
              });
            }

            else if (results.length === 1) {
              const user = results[0];
              user.firstName = req.body.firstName || user.firstName;
              user.lastName = req.body.lastName || user.lastName;
              user.street = req.body.street || user.street;
              user.city = req.body.city || user.city;
              user.isActive = req.body.isActive || user.isActive;
              user.emailAddress = req.body.emailAddress || user.emailAddress;
              user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

              const query = 'UPDATE user (firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber) WHERE id = ? VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
              conn.query(query, [firstName, lastName, street, city, isActive, emailAddress, password, phoneNumber], function (err, results, fields) {

              });
            } pool.releaseConnection(conn);
          });
        }
      });
    } catch (err) {
      res.status(400).json({
        status: 400,
        message: err.toString(),
        data: {},
      })
    }
  },


  userDelete: function (req, res, next) {
    const { userId } = req.params;
    try {
      pool.getConnection(function (err, conn) {
        if (err) {
          console.log("Error: Failed to establish a database connection");
          next({
            code: 500,
            message: "Can't connect"
          });
        }
        if (conn) {
          pool.query('SELECT * FROM user WHERE id = ?', [userId], (err, results) => {
            if (err) {
              console.log("Error retrieving user", err);
              next({
                code: 500,
                message: "Can't query select"
              });
            } else if (results.length === 0) {
              console.log("User not found");
              res.status(404).json({
                status: 404,
                message: `User met ID ${userId} niet gevonden`,
                data: {},
              });
            } else if (results.length === 1) {
              conn.query('DELETE FROM user WHERE id = ?', [userId], (err) => {
                if (err) {
                  console.log("Error deleting user", err);
                  next({
                    code: 500,
                    message: "Can't query delete"
                  });
                } else {
                  // User deleted successfully
                  res.status(200).json({
                    status: 200,
                    message: "User deleted successfully",
                    data: {},
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
  }
};

module.exports = userController