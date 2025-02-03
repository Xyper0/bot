const mongoose = require('mongoose');
const AntiSpam = require('../../database/models/Spam');
const Warnings = require('../../database/models/Warnings');
const prefix = process.env.PREFIX;

const spamMessages = new Map();

module.exports = {
    name: 'antispam',
    description: 'تشغيل / إيقاف نظام مانع تكرار الرسائل',
    usage: `${prefix}antispam on/off`,
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (msg, args, client) => {
        try {
            const chat = await msg.getChat();
            const chatId = chat.id._serialized;
            
            const antiSpam = await AntiSpam.findOne({ chatId: chatId });
if(!antiSpam) {
    const newAntiSpam = new AntiSpam({ chatId: chatId, isEnabled: false });
    await newAntiSpam.save();
}
            if (args[0] === 'on') {
                if (!antiSpam) {
                    const newAntiSpam = new AntiSpam({ chatId: chatId, isEnabled: true });
                    await newAntiSpam.save();
                    msg.reply('*تم تفعيل نظام مانع تكرار الرسائل.*');
                } else {
                    antiSpam.isEnabled = true;
                    await antiSpam.save();
                    msg.reply('*تم تفعيل نظام مانع تكرار الرسائل.*');
                }
            } else if (args[0] === 'off') {
                if (antiSpam) {
                    antiSpam.isEnabled = false;
                    await antiSpam.save();
                    msg.reply('*تم إيقاف نظام مانع تكرار الرسائل.*');
                } else {
                    msg.reply('*نظام مانع تكرار الرسائل غير مفعل في هذه المجموعة.*');
                }
            } else {
    
                msg.reply(`*حالة مانع السبام :*\n\`${(antiSpam.isEnabled == true) ? "مفعل" : "غير مفعل"}\``);
            }
        } catch (err) {
            console.error('Error: ', err);
            msg.reply('*حدث خطأ أثناء تنفيذ الأمر.*');
        }
    }
};

module.exports.listenMessages = (client) => {
    client.on('message', async (msg) => {
        const chat = await msg.getChat();
        const chatId = chat.id._serialized;
        const userId = msg.author;
        const content = msg.body;

        const antiSpam = await AntiSpam.findOne({ chatId: chatId });

        if (antiSpam && antiSpam.isEnabled) {
            const userMessages = spamMessages.get(chatId) || new Map();

            if (!userMessages.has(userId)) {
                userMessages.set(userId, []);
            }

            const isAdmin = chat.participants.some(participant => participant.id._serialized === userId && participant.isAdmin);
            const isBot = userId === client.info.wid._serialized;

            if (isAdmin || isBot) return; 

            userMessages.get(userId).push({ message: content, timestamp: Date.now() });

            userMessages.set(userId, userMessages.get(userId).filter(msgObj => Date.now() - msgObj.timestamp < 10000));

            const repeatedMessages = userMessages.get(userId).filter(msgObj => msgObj.message === content);

            if (repeatedMessages.length >= 3) {
                let warning = await Warnings.findOne({ userId: userId, chatId: chatId });
                if (!warning) {
                    warning = new Warnings({ userId: userId, chatId: chatId, warnings: 0 });
                }

                warning.warnings += 1;

                if (warning.warnings >= 3) {
                    warning.isBanned = true;
                    // طرد المستخدم بعد الإنذار الثالث
                    try {
                        // const member = await chat.getMember(userId);
                        await chat.removeParticipants([userId]); 
                        await msg.reply(`*تم طرد المستخدم من المجموعة بسبب تكرار الرسائل*`);
                        warning.warnings = 0;
                        await warning.save(); 
                    } catch (err) {
                        console.error('Error removing participant:', err);
                    }
                } else {
                    msg.reply(`*تم إعطاؤك إنذار بسبب تكرار الرسائل*\n*عدد الإنذارات الحالية* : \`${warning.warnings}\``);
                }

                await warning.save();


                userMessages.get(userId).length = 0; 
            }

            spamMessages.set(chatId, userMessages);
        }
    });
};
