function validateConfig() {
    const fs = require("fs");
    const path = require("path");
    const Ajv = require("ajv");

    const configPath = path.join(__dirname, "..", "config.json");
    const configSchemaPath = path.join(__dirname, "config-schema.json");

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const configSchema = JSON.parse(fs.readFileSync(configSchemaPath, "utf-8"));

    const ajv = new Ajv();
    const validate = ajv.compile(configSchema);
    const valid = validate(config);

    if (!valid) {
        console.error($`The config.json file contains syntax errors: ${validate.errors}\nPlease follow the schema that's present on the project's GitHub page: https://github.com/vb2007/discordbot/tree/dev-bank?tab=readme-ov-file#setting-up-the-bot`);
        process.exit(1);
    }
    else {
        console.log("The config.json file's syntax is correct.");
    }
}

module.exports = [
    validateConfig
];