import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, getConnection } from "./helpers/db.js";
getConnection();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//reads the SQL queries from a folder's subfolder
const readSQLFiles = (dir) => {
  const sqlFiles = fs.readdirSync(dir).filter((file) => file.endsWith(".sql"));
  const sqlQueries = [];

  for (const file of sqlFiles) {
    const filePath = path.join(dir, file);
    const queries = fs
      .readFileSync(filePath, "utf8")
      .split(";")
      .filter((query) => query.trim() !== "");
    sqlQueries.push(...queries);
  }

  return sqlQueries;
};

const updateCommandData = async () => {
  try {
    const csvPath = path.join(__dirname, "data", "commandData.csv");
    const csvContent = fs.readFileSync(csvPath, "utf8");

    const commands = csvContent
      .split("\n")
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        //csv parsing
        const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,"]*))/g;
        const values = [];
        let match;

        while ((match = regex.exec(line))) {
          const value = match[1] || match[2];
          values.push(value ? value.replace(/""/g, '"').trim() : "");
        }

        if (values.length < 4) return null;

        const [id, name, category, description] = values;
        return { name, category, description };
      })
      .filter((cmd) => cmd !== null);

    for (const cmd of commands) {
      console.log(`Processing command: ${cmd.name}`);

      await query(
        "INSERT INTO commandData (name, category, description) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE category = VALUES(category), description = VALUES(description)",
        [cmd.name, cmd.category, cmd.description]
      );
    }

    console.log("Command data has been updated successfully.");
  } catch (error) {
    console.error("Error updating command data:", error);
    console.error("Error details:", error.stack);
  }
};

const createTables = async () => {
  try {
    // // Would create a database if it didn't existed already, but let's just stick to the tables for now
    // await query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
    // console.log(`Database ${databaseName} created or already exists.`);

    // await query(`USE ${databaseName}`);

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

    //executes the table creation (and other) queries
    for (const sqlQuery of sqlQueries) {
      try {
        await query(sqlQuery);
        console.log("Query executed successfully.");
      } catch (error) {
        console.error("Error executing query: ", error);
      }
    }

    console.log("All queries are executed & all tables are processed.");
  } catch (error) {
    console.error("Error executing queries & creating tables: ", error);
  }
};

const init = async () => {
  await createTables();
  await updateCommandData();
  process.exit(0);
};

init();
