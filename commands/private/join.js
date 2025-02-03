module.exports = {
    name: 'join',
    description: 'الانضمام إلى مجموعة عبر الرابط المرسل في الخاص',
    isPrivateOnly:true,
    execute: async (msg, args, client) => {
        try {
            msg.reply('الامر غير جاهز حالياً')
        } catch (err) {
            console.error('Error: ', err);
            await msg.reply('حدث خطأ أثناء تنفيذ الأمر.');
        }
    },
};