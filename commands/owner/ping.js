const prefix = process.env.PREFIX; 
module.exports = {
    name: 'ping',
    description: 'التأكد من عمل البوت',
    isOwnerOnly:true,
    usage:`${prefix}ping`, 
    isPrivateOnly:true,
    execute: async (msg, args) => {
        try {
            msg.reply("Pong!");
        } catch (err) {
            console.error(err);
        }
    }
};