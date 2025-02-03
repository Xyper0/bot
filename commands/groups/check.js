const prefix = process.env.PREFIX;
const Warnings = require('../../database/models/Warnings');
const mongoose = require('mongoose'); 

module.exports = {
    name: 'check',
    aliases: ['user', 'فحص'],
    description: 'فحص شخص ماذا كان مطرود و سبب طرده',
    usage: `${prefix}check رقم الشخص`,
    isAdminOnly: true, 
    isGroupOnly: true, 
    execute: async (msg, args, client) => {
        try {
            const chat = await msg.getChat();
            let userId = `${args[0]}@c.us`;
            const isUserInGroup = chat.participants.find((p) => p.id._serialized === userId)

            if (!userId || !args[0]) {
                return msg.reply('*⚠️ يرجى إدخال رقم الشخص الذي تريد فحصه.*');
            }

            if (userId === client.info.wid.user + "@c.us") {
                return msg.reply('*❌ البوت لايملك اي انذارات*');
            }

            if (userId === msg.author) {
                return msg.reply('*❌ المشرفين لايملكون اي انذارات.*');
            }

            const isAdmin = chat.participants.find((p) => p.id.user === userId.replace('@c.us' , '') && p.isAdmin);
            if (isAdmin) {
                return msg.reply('*❌ المشرفين لايملكون اي انذارات*');
            }
            const chatId = chat.id._serialized;
            const warningData = await Warnings.findOne({ chatId: chatId, userId: userId});
            const username = await client.getContactById(userId);
            if(!username) return msg.reply('*⚠️ يرجى إدخال رقم الشخص الذي تريد فحصه.*');

            if (!warningData) {
                return msg.reply('*لم يتم حظر هذا المستخدم ❌*');
            }

            if (warningData.isBanned) {
                return msg.reply(`*🚫 تم حظر المستخدم ${username ? username.pushname : userId.replace('@c.us')} بسبب تجاوز 3 انذارات.*\n *سبب الحظر:* ${warningData.reason}`);
            } else if(isUserInGroup) {
                return msg.reply(`*اسم المستخدم* :\n ${username.pushname ? username.pushname : userId.replace('@c.us' , '')}\n *عدد الإنذارات* :\n ${warningData.warnings}\n*سبب اخر إنذار* :\n${warningData.reason}`);
            } else {
                return msg.reply(`*المستخدم غير محظور ولايتواجد بالمجموعة حالياً ✅*`)
            }
      
        } catch (err) {
            console.error('Error: ', err);
            msg.reply('*❌ حدث خطأ أثناء تنفيذ الأمر.*');
        }
    }
};
