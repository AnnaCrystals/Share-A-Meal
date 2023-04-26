// get the client
const mysql = require('mysql2');

// create the connection to database
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'shareameal',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0
});

pool.getConnection(function (err, conn) {
    // Do something with the connection
    if (err) {
        console.log("Error");
    }
    if (conn) {
        conn.query(
            'SELECT `id`, `name` FROM `meal`',
            function (err, results, fields) {
                console.log('errors: ', err)
                console.log('results: ', results); // results contains rows returned by server
            }
        );
        pool.releaseConnection(conn);
    }
});
