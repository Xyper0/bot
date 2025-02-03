const prefix = process.env.PREFIX;
module.exports = {
    name: 'delete',
    description: 'حذف الرسالة التي تم الرد عليها وطرد مستخدمها',
    aliases:['spam' , 'طرد' , 'clear'],
    usage:`${prefix}delete`,
    isAdminOnly:true,
    isGroupOnly:true, 
    execute: async (msg, args , client) => {
        try {
            const quotedMessage = await msg.getQuotedMessage();
            if (quotedMessage) {
                    const quotedUser = quotedMessage._data?.author?._serialized;
                    if (!quotedUser) {
                        return await msg.reply('*لايمكن طرد صاحب الرسالة*');
                    }
                const chat = await msg.getChat(); 
                const sender = await client.getContactById(msg.author);
                const botId = client.info.wid._serialized;
                const username = await client.getContactById(quotedUser);
                if(quotedUser === botId) return; 
                if (quotedUser === msg.author) return await msg.reply('*لايمكنك طرد نفسك !*'); 
                const isParticipant = chat.participants.some(participant => participant.id._serialized === quotedUser);
                if (!isParticipant) {
                    return await msg.reply('*الشخص الذي تم اختياره ليس عضوًا في هذه المجموعة!*');
                }
                const senderParticipant = chat.participants.find(participant => participant.id._serialized === msg.author);
                const senderIsAdmin = senderParticipant && senderParticipant.isAdmin;
                const senderIsSuperAdmin = senderParticipant && senderParticipant.isSuperAdmin;
                const quotedUserParticipant = chat.participants.find(participant => participant.id._serialized === quotedUser);
                const quotedUserIsAdmin = quotedUserParticipant && quotedUserParticipant.isAdmin;

                if (senderIsAdmin && quotedUserIsAdmin && !senderIsSuperAdmin) {
                    return await msg.reply('*لايمكنك طرد مشرف الا اذا كنت المالك فقط!*');
                }
                    await quotedMessage.delete(true);
                    await chat.removeParticipants([quotedUser]); 
                    await msg.delete(true); 
                    await msg.reply(`*تم طرد المستخدم (${username.pushname ? username.pushname : ''}) ${sender.pushname ? `بنجاح بواسطة  (${sender.pushname})` : ''}*`); 
            } else {
                await msg.reply('*قم بالرد على رسالة المستخدم المراد طرده*.');
            }
        } catch (err) {
            console.error('error : ', err);
        }
    }
};