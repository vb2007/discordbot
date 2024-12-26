const fs = require('fs');
const path = require('path');

function parseCommandsFromCSV(csvPath) {
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  return csvContent
    .split('\n')
    .slice(1)
    .filter(line => line.trim())
    .map(line => {
      const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,"]*))/g;
      const values = [];
      let match;
      
      while ((match = regex.exec(line))) {
        const value = match[1] || match[2];
        values.push(value ? value.replace(/""/g, '"').trim() : '');
      }
      
      if (values.length < 4) return null;
      
      const [id, name, category, description] = values;
      return { name, category, description };
    })
    .filter(cmd => cmd !== null);
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
  const csvCommands = parseCommandsFromCSV(path.join(__dirname, '../data/commandData.csv'));
  const fsCommands = getCommandsFromFS(path.join(__dirname, '../commands'));
  
  test('All filesystem commands exist in CSV', () => {
    fsCommands.forEach(fsCommand => {
      const csvCommand = csvCommands.find(cmd => cmd.name === fsCommand.name);
      expect(csvCommand).toBeTruthy();
    });
  });

  test('All commands have valid categories in CSV', () => {
    fsCommands.forEach(fsCommand => {
      const csvCommand = csvCommands.find(cmd => cmd.name === fsCommand.name);
      expect(csvCommand.category).toBe(fsCommand.category);
    });
  });

  test('All commands have descriptions in CSV', () => {
    fsCommands.forEach(fsCommand => {
      const csvCommand = csvCommands.find(cmd => cmd.name === fsCommand.name);
      expect(csvCommand.description).toBeTruthy();
      expect(csvCommand.description.length).toBeGreaterThan(0);
    });
  });
});