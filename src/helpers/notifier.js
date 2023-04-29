const webpush = require('web-push');

webpush.setVapidDetails(process.env.WEB_PUSH_CONTACT, process.env.VAPID_PUB_KEY, process.env.VAPID_PRIV_KEY)

const User = require(`../models/user.model`);

module.exports = {
    saveWebPush: async (webpushid, email, callback) => {
        try {
            let finduser = await User.findOne({ email });
            if(finduser){
                finduser.webpushid = webpushid
                await finduser.save()
                callback(null, finduser)
            }else{
                callback("Error", null)
            }
        } catch (err) {
            callback(err, null)
        }
    },
    pushNotifications: (emails, payload) => {
        try {
            for(let i = 0; i < emails.length; i++){
                User.findById(emails[i]).then(user => {
                    webpush.sendNotification(user.webpushid, payload).catch(err => console.log(err))
                }).catch(err => console.log(err))
            }
        } catch (error) {
            console.log(error)
        }
    }
}