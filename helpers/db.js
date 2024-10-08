require('dotenv').config()
const databaseHostAddress = process.env.DATABASE_HOST_ADDRESS;
const databaseName = process.env.DATABASE_NAME;
const databaseUser = process.env.DATABASE_USER;
const databasePassword = process.env.DATABASE_PASSWORD;

const mariadb = require("mariadb");

let pool;

function getConnection() {
    return new Promise((resolve, reject) => {
        if (pool) {
            resolve(pool);
        }
        else {
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
                        console.log(`Database connection successful to host '${databaseHostAddress}', database '${databaseName}' with user '${databaseUser}'.`);
                        conn.release();
                        resolve(pool);
                    })
                    .catch(reject);
            }
            catch (error) {
                reject(error);
            }
        }
    });
}

function handleError(error) {
    console.error("Error while trying to connect to the database: ", error);
    process.exit(1);
}

function query(...args) {
    if (!pool) {
        handleError(new Error("Database pool isn't initialized."));
    }
    return pool.query(...args).catch(handleError);
}

module.exports = {
    getConnection,
    query,
    end: () => pool && pool.end()
};