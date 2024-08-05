const fs = require("fs");
const path = require("path");
const db = require("./helpers/db");

// reads the SQL queries from a folder's subfolder
function readSQLFiles(dir) {
    const sqlFiles = fs.readdirSync(dir).filter(file => file.endsWith(".sql"));
    const sqlQueries = [];

    for (const file of sqlFiles) {
        const filePath = path.join(dir, file);
        const query = fs.readFileSync(filePath, "utf8");
        sqlQueries.push(query);
    }

    return sqlQueries;
}

async function createTables() {
    try {
        // // Would create a database if it didn't existed already, but let's just stick to the tables for now
        // await db.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
        // console.log(`Database ${databaseName} created or already exists.`);

        // await db.query(`USE ${databaseName}`);

        //reads the SQL queries using the already existing function
        const sqlDir = path.join(__dirname, "sql");
        const sqlQueries = readSQLFiles(sqlDir);

        for (const subDir of fs.readdirSync(sqlDir)) {
            const subDirPath = path.join(sqlDir, subDir);

            if (fs.lstatSync(subDirPath).isDirectory()) {
                const subDirQueries = readSQLFiles(subDirPath);
                sqlQueries.push(...subDirQueries);
            }
        }

        //executes the table creation queries
        for (const query of sqlQueries) {
            try {
                await db.query(query);
                console.log("Table created successfully.");
            }
            catch (error) {
                console.error("Error creating table: ", error);
            }
        }

        console.log("All tables are processed.") ;
    }
    catch (error) {
        console.error("Error creating tables: ", error);
    }
}

createTables();