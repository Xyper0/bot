const prefix = process.env.PREFIX;
const Warnings = require('../../database/models/Warnings');
const mongoose = require('mongoose'); 

module.exports = {
    name: 'warn',
    aliases: ['إنذار', 'انذار', 'تحذير'],
    description: 'إعطاء انذار لشخص عن طريق رقمه 3 انذارات يتبعها طرد',
    usage: `${prefix}warn رقم الشخص [سبب التحذير]`,
    isAdminOnly: true, 
    isGroupOnly: true, 
    execute: async (msg, args, client) => {
        try {
            const chat = await msg.getChat();
            let userId;
            if (msg.hasQuotedMsg) {
                const quotedMsg = await msg.getQuotedMessage();
                userId = quotedMsg.author;
            } 
            else if (msg.mentionedIds.length + 1 > 0) {
                userId = msg.mentionedIds[0];
            } 
            else {
                userId = `${args[0]}@c.us`;
                console.log(userId)
            }

            const reason = args.slice(1).join(' ') || "لم يتم إرفاق سبب";

            if (!userId) {
                return msg.reply('*⚠️ يرجى منشن الشخص الذي تريد إعطاءه إنذار.*');
            }

            if (userId === client.info.wid.user + "@c.us") {
                return msg.reply('*❌ لا يمكنك إعطاء إنذار للبوت.*');
            }

            if (userId === msg.author) {
                return msg.reply('*❌ لا يمكنك إعطاء إنذار لنفسك.*');
            }

            const isAdmin = chat.participants.find((p) => p.id.user === userId && p.isAdmin);
            if (isAdmin) {
                return msg.reply('*❌ لا يمكنك إعطاء إنذار للمشرفين.*');
            }

            const isUserInGroup = chat.participants.find((p) => p.id._serialized === userId); 
            if (!isUserInGroup) {
                return msg.reply('*❌ الشخص الذي تم إدخاله غير موجود في هذه المجموعة.*');
            }

            const chatId = chat.id._serialized;

            let warningData = await Warnings.findOne({ chatId: chatId, userId: userId });

            if (!warningData) {
                warningData = new Warnings({
                    chatId: chatId,
                    userId: userId,
                    warnings: 0,
                    isBanned: false,
                    reason: reason,
                });
            } else {
                warningData.reason = reason;
            }
            const username = await client.getContactById(userId);
            warningData.warnings += 1;

            if (warningData.warnings >= 3) {
                warningData.isBanned = true;
                await chat.removeParticipants([userId]);
                await msg.reply(`*❌ تم حظر المستخدم ${username.pushname ? username.pushname : userId.replace('@c.us' , '')} بسبب تجاوز 3 انذارات!*`);
                warningData.warnings = 0;
            } else {
                await msg.reply(`*⚠️ تم إعطاء المستخدم* :\`${username.pushname ? username.pushname : userId.replace('@c.us' , '')}\`\n *إنذار رقم* :\`${warningData.warnings}\`.\n *سبب التحذير: ${reason}*`);
            }

            await warningData.save();

        } catch (err) {
            console.error('Error: ', err);
            msg.reply('*❌ حدث خطأ أثناء تنفيذ الأمر.*');
        }
    }
};
