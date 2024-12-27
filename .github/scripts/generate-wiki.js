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
            
            const [id, name, category, description] = values;
            return { name, category, description };
        })
        .filter(cmd => cmd !== null);
}

function generateWikiContent(commands) {
    let content = "#Bot commands\n\nEvery command the bot currently has to offer can be found here.\n\n> [!NOTE] \n> This wiki gets updated automatically. After release, it can take up to 5 minutes for the possible new commands to appear on this page.\n\n## Categories\n\n";
    
    const categories = {};
    commands.forEach(cmd => {
        if (!categories[cmd.category]) {
            categories[cmd.category] = [];
        }
        categories[cmd.category].push(cmd);
    });
    
    Object.keys(categories).sort().forEach(category => {
        content += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
        content += '| Command | Description |\n';
        content += '|---------|-------------|\n';
        
        categories[category].sort((a, b) => a.name.localeCompare(b.name)).forEach(cmd => {
            content += `| \`/${cmd.name}\` | ${cmd.description} |\n`;
        });
        
        content += '\n';
    });
    
    return content;
}

const commands = parseCommandsFromCSV(path.join(__dirname, '../../src/data/commandData.csv'));
const wikiContent = generateWikiContent(commands);
fs.writeFileSync('commands.md', wikiContent);