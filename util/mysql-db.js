// get the client
const mysql = require('mysql2');
require('dotenv').config();

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_DATABASE:', process.env.DB_DATABASE);


// create the connection to database
const pool = mysql.createPool({
    host: process.env.DB_HOST, //|| 'localhost',
    user: process.env.DB_USER, //|| 'root',
    database: process.env.DB_DATABASE, //|| 'shareameal',
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    //port: process.env.DB_PORT, //|| 3306,
    //password: process.env.DB_PASSWORD || '',
});


//Misschien weghalen
pool.getConnection(function (err, conn) {
    // Do something with the connection
    if (err) {
        console.log("Error");
    }
    if (conn) {
        conn.query(
            'SELECT `id`, `name` FROM `meal`',
            function (err, results, fields) {
                //console.log('errors: ', err)
                //console.log('results: ', results); // results contains rows returned by server
            }
        );
        pool.releaseConnection(conn);
    }
});

module.exports = pool;