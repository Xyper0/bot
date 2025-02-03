const prefix = process.env.PREFIX; 
module.exports = {
    name: 'setdesc',
    aliases:['desc' , 'description'],
    description: 'تغيير وصف المجموعة عن طريق البوت',
    usage:`${prefix}setdesc الوصف هنا`,
    isAdminOnly:true, 
    isGroupOnly:true, 
    execute: async (msg, args , client) => {
        try {
            const newdesc = msg.body.split(' ').slice(1).join(' ');
            const chat = await msg.getChat(); 
            if(newdesc.length < 1) {
                msg.reply('*لم يتم ادخال وصف جديد !*')
            } else {
                await chat.setDescription(newdesc);
                await msg.reply('*تم تغيير وصف المجموعة ✅*')
            } 
        } catch (err) {
            console.error('Error: ', err);
        }
    }
};
