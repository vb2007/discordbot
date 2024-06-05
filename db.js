const mariadb = require("mariadb");
const { databaseHostAddress, databaseName, databaseUser, databasePassword } = require("./config.json");


const pool = mariadb.createPool({
    host: databaseHostAddress,
    database: databaseName,
    user: databaseUser,
    password: databasePassword,
    connectionLimit: 5
});

module.exports = pool;