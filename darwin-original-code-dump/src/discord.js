const fs = require('fs');
const path = require('path');
const config = require('./settings.json');
const { Client, GatewayIntentBits, PermissionsBitField, Events } = require('discord.js');

if(config.id=="your bot id goes here") {
    console.log("Please register a bot here https://discord.com/developers/applications\nand then put the relevant info in settings.json\n\n");
    process.exit(0);
} else console.log(`https://discord.com/api/oauth2/authorize?client_id=${config.id}&permissions=34816&scope=bot`);

function verifyMp4Exists(relativePath) {
    const fullPath = path.resolve(relativePath);
    const exists = fs.existsSync(fullPath);
    const isMp4 = path.extname(fullPath) === '.mp4';
    if(exists && isMp4) return fullPath;
    return false;
}


let ready = false;

async function online() {
    while(ready === false) await new Promise(end => setTimeout(end, 10));
}

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
] })

process.on('unhandledRejection', (reason, promise) => {
    console.error(`Unhandled Rejection at: ${promise} reason: ${reason}`);
});

process.on('uncaughtException', err => {
    console.error(`Uncaught Exception: ${err}`);
});

async function upload(title, file_on_disk) {
    if(verifyMp4Exists(file_on_disk) === false) return console.error(`file_on_disk not verified`);
    await online();
    for (const [id, channel] of client.channels.cache) {
        if(channel.type !== 0) continue;
        if(!channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) continue;
        try {
            await channel.send({ files: [file_on_disk], content: title });
        } catch (err) {
            console.error(`${channel.name} ${err}`);
        }
    }
}

async function text(str) {
    await online();
    for (const [id, channel] of client.channels.cache) {
        if(channel.type !== 0) continue;
        if(!channel.permissionsFor(client.user).has(PermissionsBitField.Flags.SendMessages)) continue;
        try {
            await channel.send(str);
        } catch (err) {
            console.error(`${channel.name} ${err}`);
        }
    }
}

client.login(config.token);

client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    ready = true;
});

module.exports = {
    upload,
    text
}