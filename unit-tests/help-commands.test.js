const fs = require('fs');
const path = require('path');

function parseCommandsFromSQL(sqlPath) {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const commands = [];
  
  //splitting by lines that contain insert statements
  const chunks = sql.split('INSERT INTO commandData');
  chunks.shift(); //skipping the create table part
  
  chunks.forEach(chunk => {
    const lines = chunk
      .split('\n')
      .filter(line => line.includes('(\''))
      .map(line => {
        const match = line.match(/\((.*?)\)/);
        if (!match) return null;
        const [name, category, description] = match[1]
          .split(',')
          .map(str => str.trim().replace(/^'|'$/g, ''));
        return { name, category, description };
      })
      .filter(Boolean);
    
    commands.push(...lines);
  });
  
  return commands;
}

function getCommandsFromFS(commandsDir) {
  const commands = [];
  
  const categories = fs.readdirSync(commandsDir);
  categories.forEach(category => {
    const categoryPath = path.join(commandsDir, category);
    if (fs.statSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath);
      files.forEach(file => {
        if (file.endsWith('.js')) {
          commands.push({
            name: file.replace('.js', ''),
            category
          });
        }
      });
    }
  });
  
  return commands;
}

describe('Command Data Tests', () => {
  const sqlCommands = parseCommandsFromSQL(path.join(__dirname, '../sql/commandData/table.sql'));
  const fsCommands = getCommandsFromFS(path.join(__dirname, '../commands'));
  
  test('All filesystem commands exist in SQL', () => {
    fsCommands.forEach(fsCommand => {
      const sqlCommand = sqlCommands.find(cmd => cmd.name === fsCommand.name);
      expect(sqlCommand).toBeTruthy();
    });
  });

  test('All commands have valid categories in SQL', () => {
    fsCommands.forEach(fsCommand => {
      const sqlCommand = sqlCommands.find(cmd => cmd.name === fsCommand.name);
      expect(sqlCommand.category).toBe(fsCommand.category);
    });
  });

  test('All commands have descriptions in SQL', () => {
    fsCommands.forEach(fsCommand => {
      const sqlCommand = sqlCommands.find(cmd => cmd.name === fsCommand.name);
      expect(sqlCommand.description).toBeTruthy();
      expect(sqlCommand.description.length).toBeGreaterThan(0);
    });
  });
});