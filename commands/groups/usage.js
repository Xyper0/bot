const prefix = process.env.prefix; 
module.exports = {
    name: 'usage',
    aliases: ['info', 'how'],
    description: 'معرفة طريقة استعمال أي أمر',
    usage: `${prefix}usage هنا الأمر`,
    isAdminOnly: true, 
    isGroupOnly: true, 
    execute: async (msg, args, client, commands) => {
        try {
            if (args.length === 0) {
                return msg.reply('⚠️ يرجى تحديد الأمر الذي تريد معرفة طريقة استعماله.\nمثال: `!usage setdesc`');
            }

            const commandName = args[0].toLowerCase();
            let command = commands.get(commandName);  
            if (!command) {
                for (const cmd of commands.values()) {
                    if (cmd.aliases && cmd.aliases.includes(commandName)) {
                        command = cmd;
                        break;
                    }
                }
            }

            if (!command) {
                return msg.reply(`❌ الأمر "${commandName}" غير موجود.`);
            }

            let replyMessage = `📝 *طريقة استعمال الأمر :*\n\`${command.usage}\`\n`;

            replyMessage += `\n📜 *الوصف:*\n \`${command.description}\`\n`;

            if (command.aliases && command.aliases.length > 0) {
                replyMessage += `🔍 *الاختصارات:*\n \`[${command.aliases.map(alias => `${alias}`).join('`, `')}]\`\n`;
            }
            if (command.isGroupOnly) {
                replyMessage += '\n👥 *مخصص للمجموعات فقط.*\n';
            }
            if (command.isAdminOnly) {
                replyMessage += '👑 *مخصص للمشرفين فقط.*\n';
            }


            msg.reply(replyMessage);

        } catch (err) {
            console.error('Error: ', err);
        }
    }
};
