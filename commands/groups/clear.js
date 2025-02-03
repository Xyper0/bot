const prefix = process.env.PREFIX;
const Warnings = require('../../database/models/Warnings');
const mongoose = require('mongoose'); 

module.exports = {
    name: 'clear',
    aliases: ['مسح'],
    description: 'مسح انذارات مستخدم', 
    usage: `${prefix}clear رقم الشخص`,
    isAdminOnly: true, 
    isGroupOnly: true, 
    execute: async (msg, args, client) => {
        try {
            const chat = await msg.getChat();
            let userId = `${args[0]}@c.us`;

            if (!userId) {
                return msg.reply('*⚠️ يرجى إدخال رقم الشخص الذي تريد مسح انذاراته.*');
            }
            if (userId === client.info.wid.user + "@c.us") {
                return msg.reply('*❌ البوت لايملك اي انذارات*');
            }

            if (userId === msg.author) {
                return msg.reply('*❌ المشرفين لايملكون اي انذارات*');
            }

            const isAdmin = chat.participants.find((p) => p.id.user === userId && p.isAdmin);
            if (isAdmin) {
                return msg.reply('*❌ المشرفين لايملكون اي انذارات*');
            }

            const isUserInGroup = chat.participants.find((p) => p.id._serialized === userId);

            const chatId = chat.id._serialized;
            const warningData = await Warnings.findOne({ chatId: chatId, userId: userId });

            const username = await client.getContactById(userId);

            if (!warningData) {
                return msg.reply('*❌ لم يتم العثور على انذارات لهذا المستخدم.*');
            }

            await Warnings.deleteOne({ chatId: chatId, userId: userId });

            return msg.reply(`*✅ تم مسح جميع الانذارات للمستخدم ${username.pushname ? username.pushname : userId.replace('@c.us', '')} من قاعدة البيانات.*`);

        } catch (err) {
            console.error('Error: ', err);
            msg.reply('*❌ حدث خطأ أثناء تنفيذ الأمر.*');
        }
    }
};
