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

//parses CSV line into array of values
const parseCSVLine = (line) => {
  const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,"]*))/g;
  const values = [];
  let match;

  while ((match = regex.exec(line))) {
    const value = match[1] || match[2];
    values.push(value ? value.replace(/""/g, '"').trim() : "");
  }

  return values;
};

//universal function to parse and update CSV data into database tables
const parseAndUpdateCSV = async (csvFileName, tableName, columnMapping) => {
  try {
    const csvPath = path.join(__dirname, "data", csvFileName);
    const csvContent = fs.readFileSync(csvPath, "utf8");

    //parse CSV and extract headers
    const lines = csvContent.split("\n").filter((line) => line.trim());
    const headers = parseCSVLine(lines[0]);

    const rows = lines
      .slice(1)
      .map((line) => {
        const values = parseCSVLine(line);

        if (values.length < headers.length) return null;

        //create object with header-value pairs
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        return row;
      })
      .filter((row) => row !== null);

    //prepare SQL query
    const columns = columnMapping.columns;
    const placeholders = columns.map(() => "?").join(", ");
    const updateClause = columns
      .filter((col) => !columnMapping.skipUpdate?.includes(col))
      .map((col) => `${col} = VALUES(${col})`)
      .join(", ");

    const insertQuery = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updateClause}`;

    for (const row of rows) {
      const identifier = row[columnMapping.identifier] || row.name || row.id;
      console.log(`Processing ${tableName}: ${identifier}`);

      const values = columns.map((col) => row[col]);

      await query(insertQuery, values);
    }

    console.log(`${tableName} data has been updated successfully.`);
  } catch (error) {
    console.error(`Error updating ${tableName} data:`, error);
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

  await parseAndUpdateCSV("commandData.csv", "commandData", {
    columns: ["name", "category", "description"],
    identifier: "name",
  });

  await parseAndUpdateCSV("economyStore.csv", "economyStore", {
    columns: ["price", "name", "description"],
    identifier: "name",
  });

  process.exit(0);
};

init();
