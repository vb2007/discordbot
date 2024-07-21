const mariadb = require("mariadb");
const { databaseHostAddress, databaseName, databaseUser, databasePassword } = require("./config.json");

let pool;

function getConnection() {
    try {
        pool = mariadb.createPool({
            host: databaseHostAddress,
            database: databaseName,
            user: databaseUser,
            password: databasePassword,
            connectionLimit: 5
        });
    
        pool.getConnection()
            .then(conn => {
                console.log("Database connection successful.");
                conn.release();
            })
            .catch(handleError);
    }
    catch (error) {
        handleError(error);
    }
}

function handleError(error){
    console.error("Error while trying to connect to the database: ", error);
    process.exit(1);
}

function query(...args) {
    if (!pool) {
        handleError(new Error("Database pool isn't initialized."));
    }
    return pool.query(...args).catch(handleError);
}

getConnection();

module.exports = {
    query,
    end: () => pool && pool.end()
};