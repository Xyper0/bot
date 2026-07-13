#  📱 WhatsApp Bot - Group Management

##  ✨ Features
**Anti-Spam System<br>
Auto-Lock Schedule<br>
Warning System (3 warnings = kick)<br>
Admin Commands**

##  ⚙️ Setup
Create .env:
```
PREFIX=!
OWNER=BOT_OWNER_NUMBER@c.us
MONGO_URL=DATABASE_URL
```
##  📋 Commands
**Command	Description<br>
!antispam on/off	Anti-spam toggle<br>
!autolock on/off	Auto-lock toggle<br>
!chat	Lock/unlock chat<br>
!warn @user [reason]	Warn user<br>
!check @user	Check warnings<br>
!clear @user	Clear warnings<br>
!delete	Delete & kick (reply)<br>
!mention	@everyone<br>
!setdesc [text]	Set description<br>
!commands	Show commands<br>
!usage [cmd]	Command help**


##  📁 Structure

**commands/groups/     # Group commands<br>
commands/owner/      # Owner commands<br>
database/models/     # MongoDB schemas<br>**


##  📦 Dependencies
```
npm i whatsapp-web.js mongoose qrcode-terminal dotenv node-schedule
```

##  ⚠️ Notes
**Bot must be admin<br>
MongoDB required<br>
Owner number format: OWNER_NUMBER_HERE@c.us<br>**
