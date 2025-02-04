require('dotenv').config(); 
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

const connectDB = require('./database/db');
const antiSpamCommands  = require('./commands/groups/antispam'); 
const prefix = process.env.PREFIX; 
const ownerNumber = process.env.OWNER; 

const client = new Client({
    authStrategy: new LocalAuth(),
});


const commands = new Map();

connectDB(); 

const commandHandler = (folderPath) => {
    fs.readdirSync(folderPath).forEach(file => {
        const filePath = path.resolve(folderPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            commandHandler(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                commands.set(command.name, command); 
                console.log(`Successfully loaded command: ${command.name}`);
            } catch (error) {
                console.error(`Error loading command from ${filePath}:`, error);
            }
        }
    });
};
commandHandler('./commands');
client.commands = commands;

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true }, function (Generate_qr) {
        console.log(Generate_qr);
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
    antiSpamCommands.listenMessages(client);
});


client.on('message', async (msg) => {
    if (!msg.body.startsWith(prefix)) return;
    const args = msg.body.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = Array.from(commands.values()).find(
        (cmd) => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName))
    );

    if (!command) return;

    const chat = await msg.getChat();

    if (command.isGroupOnly && !chat.isGroup) {
        return;
    }
    if (command.isPrivateOnly && chat.isGroup) {
        return;
    }

    if (chat.isGroup) {
        const bot = chat.participants.find(p => p.id._serialized === client.info.wid._serialized);
        if (!bot || !bot.isAdmin) {
            await msg.reply("*عذراً، البوت ليس مشرفًا في المجموعة ولا يمكنه تنفيذ الأوامر.*");
            return;
        }
    }

    if (command.isAdminOnly && chat.isGroup) {
        const participant = chat.participants.find(p => p.id._serialized == msg.author);
        if (!participant.isAdmin) return;
    }

    if (command.isOwnerOnly) {
        if (msg.from !== ownerNumber) {
            return;
        }
    }

    try {
        await command.execute(msg, args, client , commands);
    } catch (err) {
        console.error(err);
    }
});

client.initialize();