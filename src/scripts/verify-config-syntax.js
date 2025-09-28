import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "..", "..", "config.json");
const configSchemaPath = path.join(__dirname, "config-schema.json");

const configJson = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const configSchemaJson = JSON.parse(fs.readFileSync(configSchemaPath, "utf-8"));

const ajv = new Ajv();
const validate = ajv.compile(configSchemaJson);
const valid = validate(configJson);

export const validateConfig = () => {
  if (!valid) {
    console.error(
      `The config.json file contains syntax errors:\n${JSON.stringify(validate.errors, null, 2)}\nPlease follow the schema that's present on the project's GitHub page: https://github.com/vb2007/discordbot/tree/main?tab=readme-ov-file#setting-up-the-bot`
    );
    process.exit(1);
  } else {
    console.log("The config.json file's syntax is correct.");
  }
};
