import fs from "fs";
import path from "path";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const getAllCommandFiles = (foldersPath) => {
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
};

const validateCommand = (filePath) => {
  const issues = [];
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
    return [`failed to parse: ${parseError.message}`];
  }

  const validation = validateCommandStructure(ast);

  if (!validation.hasModuleExports) issues.push("missing module.exports");
  if (!validation.hasData) issues.push("missing data property");
  if (!validation.hasExecute) issues.push("missing execute method");
  if (!validation.hasSlashCommandBuilder) issues.push("missing SlashCommandBuilder");
  if (!validation.hasSetName) issues.push("missing setName()");
  if (!validation.hasSetDescription) issues.push("missing setDescription()");

  return issues;
};

const validateCommandStructure = (ast) => {
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
          const key = prop.key.name || prop.key.value;

          if (key === "data") {
            hasData = true;
            if (prop.value && prop.value.type === "CallExpression") {
              const builderValidation = checkSlashCommandBuilderChain(prop.value);
              hasSlashCommandBuilder = builderValidation.hasSlashCommandBuilder;
              hasSetName = builderValidation.hasSetName;
              hasSetDescription = builderValidation.hasSetDescription;
            }
          }

          if (key === "execute") {
            hasExecute = true;
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
};

const checkSlashCommandBuilderChain = (node) => {
  let hasSlashCommandBuilder = false;
  let hasSetName = false;
  let hasSetDescription = false;

  function traverseChain(currentNode) {
    if (currentNode.type === "CallExpression") {
      if (currentNode.callee && currentNode.callee.type === "MemberExpression") {
        const methodName = currentNode.callee.property && currentNode.callee.property.name;

        if (methodName === "setName") hasSetName = true;
        if (methodName === "setDescription") hasSetDescription = true;

        if (currentNode.callee.object) {
          traverseChain(currentNode.callee.object);
        }
      }
    } else if (currentNode.type === "NewExpression") {
      if (currentNode.callee && currentNode.callee.name === "SlashCommandBuilder") {
        hasSlashCommandBuilder = true;
      }
    }
  }

  traverseChain(node);

  return { hasSlashCommandBuilder, hasSetName, hasSetDescription };
};

describe("Command structure validation", () => {
  const foldersPath = path.join(__dirname, "..", "commands");
  const commandFiles = getAllCommandFiles(foldersPath);

  test("all commands should have valid structure", () => {
    const invalidCommands = [];

    commandFiles.forEach((filePath) => {
      const fileName = path.basename(filePath);
      const issues = validateCommand(filePath);

      if (issues.length > 0) {
        invalidCommands.push(`❌ ${fileName}: ${issues.join(", ")}`);
      }
    });

    expect(invalidCommands).toEqual([]);
  });
});
