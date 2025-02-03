const prefix = process.env.PREFIX; 

module.exports = {
    name: 'commands',
    aliases: ['الأوامر', 'cmds', 'الاوامر', 'group', 'private' , 'groups'],
    usage:`${prefix}commands`,
    description: 'عرض الأوامر المتاحة',
    isAdminOnly: true,
    execute: async (msg, args, client) => {
        try {
            const commands = Array.from(client.commands.values());
            const chat = await msg.getChat();
            const isGroup = chat.isGroup;
            const isOwner = msg.from === process.env.OWNER;

            const commandType = msg.body.split(' ')[0].toLowerCase(); 

            let commandList = "";

            if (commandType === prefix + 'group' || commandType === prefix + 'groups') {
                commandList = "👥 *أوامر المجموعات المتاحة:*\n\n";
                commands.forEach((cmd) => {
                    if (!isOwner && cmd.isOwnerOnly) return; 
                    if (!cmd.isGroupOnly && !cmd.isOwnerOnly) return; 

                    commandList += `🔹 *الأمر:* ${cmd.name}\n`;
                    commandList += `📄 *الوصف:* ${cmd.description}\n`;

                    if (cmd.aliases && cmd.aliases.length > 0) {
                        commandList += `🔸 *الأسماء الأخرى:* [${cmd.aliases.join(', ')}]\n`;
                    } else {
                        commandList += `🔸 *الأسماء الأخرى:* لا يوجد\n`;
                    }

                    if (cmd.isOwnerOnly) {
                        commandList += `🔒 *الصلاحية:* للمالك فقط\n`;
                    } else if (cmd.isAdminOnly) {
                        commandList += `🔒 *الصلاحية:* للمشرفين\n`;
                    } else {
                        commandList += `🔓 *الصلاحية:* متاح للجميع\n`;
                    }

                    commandList += "\n────────────────────\n";
                });
            } else if (commandType === prefix + 'private') {
                commandList = "🔒 *أوامر الخاص المتاحة:*\n\n";
                commands.forEach((cmd) => {
                    if (!cmd.isPrivateOnly) return; 
                    if (!isOwner && cmd.isOwnerOnly) return; 

                    commandList += `🔹 *الأمر:* ${cmd.name}\n`;
                    commandList += `📄 *الوصف:* ${cmd.description}\n`;

                    if (cmd.aliases && cmd.aliases.length > 0) {
                        commandList += `🔸 *الأسماء الأخرى:* [${cmd.aliases.join(', ')}]\n`;
                    } else {
                        commandList += `🔸 *الأسماء الأخرى:* لا يوجد\n`;
                    }

                    if (cmd.isOwnerOnly) {
                        commandList += `🔒 *الصلاحية:* للمالك فقط\n`;
                    } else {
                        commandList += `🔓 *الصلاحية:* متاح للجميع\n`;
                    }

                    commandList += "\n────────────────────\n";
                });
            } else if (commandType === prefix  + 'commands') {
                commandList = "📋 *استخدم أحد الأوامر التالية لعرض الأوامر المتاحة:*\n\n";
                commandList += "👥 *"+ prefix +"groups* - لعرض أوامر المجموعات\n\n";
                commandList += "🔒 *"+ prefix  +"private* - لعرض أوامر الخاص\n";
            }

            await msg.reply(commandList);
        } catch (err) {
            console.error('Error: ', err);
        }
    }
};