const prefix = process.env.PREFIX;
module.exports = {
    name: 'chat',
    description: 'اغلاق او فتح الشات حسب حالته',
    usage:`${prefix}chat`,
    isAdminOnly:true, 
    isGroupOnly:true, 
    execute: async (msg, args , client) => {
        try { 
        const chat = await msg.getChat(); 
        const isChatlocked =  chat.groupMetadata.announce; 
        if(isChatlocked) {
           await chat.setMessagesAdminsOnly(false);
           await msg.reply('*تم فتح الدردشة, يمكن للجميع التحدث الان.*')
        } else  {
            await chat.setMessagesAdminsOnly(true);
            await msg.reply('*تم إغلاق الدردشة, لايمكن لغير المشرفين التحدث الان.*');
        }
        } catch (err) {
            console.error('Error: ', err);
        }
    }
};
