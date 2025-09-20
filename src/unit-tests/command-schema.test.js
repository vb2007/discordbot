const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");
const traverse = require("@babel/traverse").default;

expect.extend({
  toHaveModuleExports(fileName, validationResult) {
    const pass = validationResult.hasModuleExports;
    return {
      pass,
      message: () =>
        `❌ ${fileName}: Missing module.exports assignment. Expected: module.exports = { data: ..., execute: ... }`,
    };
  },

  toHaveDataProperty(fileName, validationResult) {
    const pass = validationResult.hasData;
    return {
      pass,
      message: () =>
        `❌ ${fileName}: Missing "data" property in module.exports. Discord commands require a data property.`,
    };
  },

  toHaveExecuteMethod(fileName, validationResult) {
    const pass = validationResult.hasExecute;
    return {
      pass,
      message: () =>
        `❌ ${fileName}: Missing "execute" property in module.exports. Discord commands require an execute function.`,
    };
  },

  toUseSlashCommandBuilder(fileName, validationResult) {
    const pass = validationResult.hasSlashCommandBuilder;
    return {
      pass,
      message: () =>
        `❌ ${fileName}: data property must use "new SlashCommandBuilder()". Found different structure.`,
    };
  },

  toHaveSetNameMethod(fileName, validationResult) {
    const pass = validationResult.hasSetName;
    return {
      pass,
      message: () =>
        `❌ ${fileName}: SlashCommandBuilder chain missing ".setName()". Discord requires all commands to have a name.`,
    };
  },

  toHaveSetDescriptionMethod(fileName, validationResult) {
    const pass = validationResult.hasSetDescription;
    return {
      pass,
      message: () =>
        `❌ ${fileName}: SlashCommandBuilder chain missing ".setDescription()". Discord requires all commands to have a description.`,
    };
  },
});

describe("Command structure validation", () => {
  const foldersPath = path.join(__dirname, "..", "commands");
  const commandFiles = getAllCommandFiles(foldersPath);

  describe("Basic structure requirements", () => {
    test.each(commandFiles)(
      "should have module.exports structure - %s",
      (filePath) => {
        const fileName = path.basename(filePath);
        const validationResult = getValidationResult(filePath);

        expect(fileName).toHaveModuleExports(validationResult);
      },
    );

    test.each(commandFiles)("should have data property - %s", (filePath) => {
      const fileName = path.basename(filePath);
      const validationResult = getValidationResult(filePath);

      expect(fileName).toHaveDataProperty(validationResult);
    });

    test.each(commandFiles)("should have execute method - %s", (filePath) => {
      const fileName = path.basename(filePath);
      const validationResult = getValidationResult(filePath);

      expect(fileName).toHaveExecuteMethod(validationResult);
    });
  });

  describe("Discord.js SlashCommandBuilder requirements", () => {
    test.each(commandFiles)(
      "should use SlashCommandBuilder constructor - %s",
      (filePath) => {
        const fileName = path.basename(filePath);
        const validationResult = getValidationResult(filePath);

        expect(fileName).toUseSlashCommandBuilder(validationResult);
      },
    );

    test.each(commandFiles)(
      "should have setName() method call - %s",
      (filePath) => {
        const fileName = path.basename(filePath);
        const validationResult = getValidationResult(filePath);

        expect(fileName).toHaveSetNameMethod(validationResult);
      },
    );

    test.each(commandFiles)(
      "should have setDescription() method call - %s",
      (filePath) => {
        const fileName = path.basename(filePath);
        const validationResult = getValidationResult(filePath);

        expect(fileName).toHaveSetDescriptionMethod(validationResult);
      },
    );
  });

  describe("Complete command validation", () => {
    test("all commands should have complete structure", () => {
      const invalidCommands = [];

      commandFiles.forEach((filePath) => {
        const fileName = path.basename(filePath);
        const validationResult = getValidationResult(filePath);

        const issues = [];
        if (!validationResult.hasModuleExports)
          issues.push("missing module.exports");
        if (!validationResult.hasData) issues.push("missing data property");
        if (!validationResult.hasExecute) issues.push("missing execute method");
        if (!validationResult.hasSlashCommandBuilder)
          issues.push("missing SlashCommandBuilder");
        if (!validationResult.hasSetName) issues.push("missing setName()");
        if (!validationResult.hasSetDescription)
          issues.push("missing setDescription()");

        if (issues.length > 0) {
          invalidCommands.push(`${fileName}: ${issues.join(", ")}`);
        }
      });

      expect(invalidCommands).toEqual([]);
    });
  });
});

function getAllCommandFiles(foldersPath) {
  const commandFiles = [];
  const commandFolders = fs.readdirSync(foldersPath);

  commandFolders.forEach((folder) => {
    const commandsPath = path.join(foldersPath, folder);
    const files = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"))
      .map((file) => path.join(commandsPath, file));

    commandFiles.push(...files);
  });

  return commandFiles;
}

function getValidationResult(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");

  let ast;
  try {
    ast = parse(fileContent, {
      sourceType: "module",
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: ["objectRestSpread", "decorators-legacy"],
    });
  } catch (parseError) {
    throw new Error(`Failed to parse ${filePath}: ${parseError.message}`);
  }

  return validateCommandStructure(ast);
}

function validateCommandStructure(ast) {
  let hasData = false;
  let hasExecute = false;
  let hasModuleExports = false;
  let hasSlashCommandBuilder = false;
  let hasSetName = false;
  let hasSetDescription = false;

  traverse(ast, {
    AssignmentExpression(path) {
      if (
        path.node.left.type === "MemberExpression" &&
        path.node.left.object.name === "module" &&
        path.node.left.property.name === "exports" &&
        path.node.right.type === "ObjectExpression"
      ) {
        hasModuleExports = true;

        path.node.right.properties.forEach((prop) => {
          if (
            prop.type === "ObjectProperty" ||
            prop.type === "Property" ||
            prop.type === "ObjectMethod"
          ) {
            const key = prop.key.name || prop.key.value;

            if (key === "data") {
              hasData = true;
              if (prop.value && prop.value.type === "CallExpression") {
                const builderValidation = checkSlashCommandBuilderChain(
                  prop.value,
                );
                hasSlashCommandBuilder =
                  builderValidation.hasSlashCommandBuilder;
                hasSetName = builderValidation.hasSetName;
                hasSetDescription = builderValidation.hasSetDescription;
              }
            }

            if (key === "execute") {
              hasExecute = true;
            }
          }
        });
      }
    },
  });

  return {
    hasData,
    hasExecute,
    hasModuleExports,
    hasSlashCommandBuilder,
    hasSetName,
    hasSetDescription,
  };
}

function checkSlashCommandBuilderChain(node) {
  let hasSlashCommandBuilder = false;
  let hasSetName = false;
  let hasSetDescription = false;

  function traverseChain(currentNode) {
    if (currentNode.type === "CallExpression") {
      if (
        currentNode.callee &&
        currentNode.callee.type === "MemberExpression"
      ) {
        const methodName =
          currentNode.callee.property && currentNode.callee.property.name;

        if (methodName === "setName") {
          hasSetName = true;
        }
        if (methodName === "setDescription") {
          hasSetDescription = true;
        }

        if (currentNode.callee.object) {
          traverseChain(currentNode.callee.object);
        }
      }
    } else if (currentNode.type === "NewExpression") {
      if (
        currentNode.callee &&
        currentNode.callee.name === "SlashCommandBuilder"
      ) {
        hasSlashCommandBuilder = true;
      }
    }
  }

  traverseChain(node);

  return {
    hasSlashCommandBuilder,
    hasSetName,
    hasSetDescription,
  };
}
