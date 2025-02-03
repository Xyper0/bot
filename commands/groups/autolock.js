const schedule = require('node-schedule');
const Schedule = require('../../database/models/Schedule');
const prefix = process.env.PREFIX; 
const jobs = {};

module.exports = {
    name: 'autolock',
    description: 'تشغيل أو إيقاف الإغلاق التلقائي للمجموعة',
    usage:`${prefix}autolock on/off ثم تجيب على الاسئلة`,
    isAdminOnly: true,
    isGroupOnly: true,
    execute: async (msg, args, client) => {
        try {
            const chat = await msg.getChat();
            const chatId = chat.id._serialized;
            const action = args[0];

            if (!action) {
                const existingSchedule = await Schedule.findOne({ chatId });
                let statusMessage = 'حالة الإغلاق التلقائي: ';

                if (!existingSchedule || !existingSchedule.isActive) {
                    statusMessage += 'غير مفعل.\n';
                } else {
                    const closeTime12h = convertTo12Hour(existingSchedule.closeTime);
                    const openTime12h = convertTo12Hour(existingSchedule.openTime);

                    statusMessage += `مفعل.\n` +
                                    `⏰ وقت الإغلاق: ${closeTime12h}\n` +
                                    `⏰ وقت الفتح: ${openTime12h}\n`;
                }

                statusMessage +=
                    '\nتعليمات الاستخدام:\n' +
                    '✅ لتشغيل الإغلاق التلقائي:\n' +
                    '`!autolock on`\n' +
                    '✅ لإيقاف الإغلاق التلقائي:\n' +
                    '`!autolock off`\n' +
                    '✅ لعرض الحالة الحالية:\n' +
                    '`!autolock`';

                await msg.reply(statusMessage);
                return;
            }

            if (action === 'on') {
                await msg.reply(`*يرجى إدخال وقت الإغلاق بتنسيق 12 ساعة AM/PM*`);
                let closeTime12h;
                try {
                    closeTime12h = await waitForResponse(msg, client);
                } catch (err) {
                    if (err === 'انتهى الوقت. لم يتم إدخال الوقت.') {
                        return await msg.reply('انتهى الوقت. لم يتم إدخال الوقت.');
                    }
                    throw err;
                }
                const closeTime24h = convertTo24Hour(closeTime12h, false); 

                await msg.reply(`*يرجى إدخال وقت الفتح بتنسيق 12 ساعة AM/PM*`);
                let openTime12h;
                try {
                    openTime12h = await waitForResponse(msg, client);
                } catch (err) {
                    if (err === 'انتهى الوقت. لم يتم إدخال الوقت.') {
                        return await msg.reply('انتهى الوقت. لم يتم إدخال الوقت.');
                    }
                    throw err;
                }
                const openTime24h = convertTo24Hour(openTime12h, false);

                if (jobs[chatId]) {
                    if (jobs[chatId].closeJob) jobs[chatId].closeJob.cancel();
                    if (jobs[chatId].openJob) jobs[chatId].openJob.cancel();
                }

                const closeTime24hWithMinute = convertTo24Hour(closeTime12h, true);
                const openTime24hWithMinute = convertTo24Hour(openTime12h, true);

                jobs[chatId] = {
                    closeJob: schedule.scheduleJob(`0 ${closeTime24hWithMinute.split(':')[1]} ${closeTime24hWithMinute.split(':')[0]} * * *`, async () => {
                        await chat.setMessagesAdminsOnly(true);
                        await msg.reply('*🔒 تم إغلاق المجموعة تلقائيًا.*');
                    }),
                    openJob: schedule.scheduleJob(`0 ${openTime24hWithMinute.split(':')[1]} ${openTime24hWithMinute.split(':')[0]} * * *`, async () => {
                        await chat.setMessagesAdminsOnly(false);
                        await msg.reply('*🔓 تم فتح المجموعة تلقائيًا.*');
                    })
                };

                const existingSchedule = await Schedule.findOneAndUpdate(
                    { chatId },
                    { closeTime: closeTime24h, openTime: openTime24h, isActive: true },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );

                await msg.reply(
                    'تم تفعيل الإغلاق التلقائي بنجاح.\n' +
                    `⏰ وقت الإغلاق: ${convertTo12Hour(closeTime24h)}\n` + 
                    `⏰ وقت الفتح: ${convertTo12Hour(openTime24h)}` 
                );
            } else if (action === 'off') {
                const existingSchedule = await Schedule.findOne({ chatId, isActive: true });
                if (!existingSchedule) {
                    return msg.reply('الإغلاق التلقائي غير مفعل.');
                }

                if (jobs[chatId]) {
                    if (jobs[chatId].closeJob) jobs[chatId].closeJob.cancel();
                    if (jobs[chatId].openJob) jobs[chatId].openJob.cancel();
                    delete jobs[chatId];
                }

                existingSchedule.isActive = false;
                await existingSchedule.save();

                await msg.reply('*تم ايقاف الإغلاق التلقائي بنجاح ✅*');
            } else {
                await msg.reply(`استخدم ${prefix}\`autolock on\` لتشغيل الإغلاق التلقائي أو \`${prefix}autolock off\` لإيقافه.`);
            }
        } catch (err) {
            console.error('Error: ', err);
            await msg.reply('حدث خطأ أثناء تنفيذ الأمر.');
        }
    },
};

function waitForResponse(msg, client) {
    return new Promise((resolve, reject) => {
        const originalMsgId = msg.id._serialized;

        const timeout = setTimeout(() => {
            client.removeListener('message_create', responseHandler);
            reject('*انتهى الوقت لم يتم ادخال رد.*');
        }, 30000);

        const responseHandler = async (newMsg) => {
            if (newMsg.from === msg.from) {
                const time12h = newMsg.body.trim();
                try {
                    const time24h = convertTo24Hour(time12h, false);
                    clearTimeout(timeout);
                    client.removeListener('message_create', responseHandler);
                    resolve(time12h); 
                } catch (err) {
                    clearTimeout(timeout);
                    client.removeListener('message_create', responseHandler);
                    await msg.reply('*تنسيق الوقت غير صحيح يرجى ادخال الساعة بنظام AM/PM\n مثال : 1:54AM*');
                    reject(err);
                }
            }
        };

        client.on('message_create', responseHandler);
    });
}

function convertTo24Hour(time12h, addMinute = true) {
    time12h = time12h.trim().toUpperCase();

    const match12h = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
    if (!match12h) {
        throw new Error(`*يرجى ادخال الوقت بنظام AM/PM*`);
    }

    let [_, hours, minutes, period] = match12h;

    if (parseInt(hours, 10) > 12) {  
        throw new Error('*الساعة يجب ان تكون بين 1 و 12 AM/PM*');
    }

    if (!period) {
        const hoursInt = parseInt(hours, 10);
        if (hoursInt >= 12) {
            period = 'PM';
        } else {
            period = 'AM';
        }
    }

    if (period === 'PM' && hours !== '12') {
        hours = parseInt(hours, 10) + 12;
    } else if (period === 'AM' && hours === '12') {
        hours = '00';
    }

    if (addMinute) {
        let minutesInt = parseInt(minutes, 10);
        minutesInt += 1;
        if (minutesInt >= 60) {
            minutesInt = 0;
            hours = parseInt(hours, 10) + 1;
            if (hours >= 24) {
                hours = 0;
            }
        }
        minutes = String(minutesInt).padStart(2, '0');
    }

    hours = String(hours).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function convertTo12Hour(time24h) {
    const [hours, minutes] = time24h.split(':');
    let period = 'AM';
    let hours12h = parseInt(hours, 10);

    if (hours12h >= 12) {
        period = 'PM';
        if (hours12h > 12) {
            hours12h -= 12;
        }
    } else if (hours12h === 0) {
        hours12h = 12;
    }

    return `${hours12h}:${minutes} ${period}`;
}