const prefix = process.env.PREFIX;

module.exports = {
    name: 'mention',
    aliases: ['all', 'منشن', 'everyone'],
    description: 'منشن لكل الي فالقروب',
    usage: `${prefix}mention`,
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (msg, args, client) => {
        try {
            const chat = await msg.getChat();

            const participants = chat.participants;

            if (participants.length === 0) {
                return msg.reply('❌ لا يوجد أعضاء في هذه المجموعة!');
            }

            let mentionText = 'إلى جميع الأعضاء:\n';
            const mentions = [];

            participants.forEach(participant => {
                mentionText += `@${participant.id.user} `;
                mentions.push(participant.id._serialized);
            });

            await msg.reply(mentionText, null, { mentions });


        } catch (err) {
            console.error('Error: ', err);
            msg.reply('*❌ حدث خطأ أثناء تنفيذ الأمر.*');
        }
    }
};
