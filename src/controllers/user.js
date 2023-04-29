const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const webpush = require('web-push');
webpush.setVapidDetails(process.env.WEB_PUSH_CONTACT, process.env.VAPID_PUB_KEY, process.env.VAPID_PRIV_KEY)

const { pushNotifications } = require('../helpers/notifier');

const { signAccessToken } = require("../helpers/jwt");

const fs = require('fs');

const { generateCertificate, downloadCertificate } = require("../helpers/certificategen");
const Task = require("../models/task.model");
const User = require("../models/user.model");

const TaskStatus = {
    listed: 'listed',
    started: 'started',
    completed: 'completed',
    cancelled: 'cancelled',
}

const createLoginUser = async (req, res, next) => {
    try {
        const { tokenId } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = await User.create({
                fullName: payload.name,
                email: payload.email,
                userType: "volunteer",
            });
        }
        let token = await signAccessToken(payload.email);
        res.status(200).json({ token, user });
    } catch (error) {
        next(error)
    }
}

const acceptTask = async (req, res, next) => {
    try {
        let email = req.payload.aud;
        let { _id } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let findtask = await Task.findOne({ _id });
        if (!findtask) {
            return res.status(404).json({ message: "Task not found" });
        }
        let findauthor = await User.findOne({ _id: findtask.author });
        if (!findtask.volunteers.includes(user._id)) findtask.volunteers.push(user._id);
        await findtask.save();
        res.status(200).json({ message: "Task accepted successfully" });
        if(findauthor.webpushid){
            pushNotifications([findauthor.email], 
                JSON.stringify({
                    title: "Task Accepted",
                    body: `Task ${findtask.name} has been accepted by ${user.fullName}`,
                })
            );
        }
        let certres = await generateCertificate("ParticipationCertificate", { task: findtask, author: findauthor, volunteer: user });
    } catch (error) {
        next(error)
    }
}

const rejectTask = async (req, res, next) => {
    try {
        let email = req.payload.aud;
        let { _id } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let findtask = await Task.findOne({ _id });
        if (!findtask) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (!findtask.rejectedBy.includes(user._id)) findtask.rejectedBy.push(user._id);
        await findtask.save();
        res.status(200).json({ message: "Task updated successfully" });
    } catch (error) {
        next(error)
    }
}

// Admnin Controllers

const employerCreateLoginUser = async (req, res, next) => {
    try {
        const { tokenId } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = await User.create({
                fullName: payload.name,
                email: payload.email,
                userType: "employer",
            });
        }
        if (user.userType !== "employer") return res.status(401).json({ message: "Unauthorized" });
        let token = await signAccessToken(payload.email);
        res.status(200).json({ token, user });
    } catch (error) {
        next(error)
    }
}

const createTask = async (req, res, next) => {
    try {
        let email = req.payload.aud;
        let findauthor = await User.findOne({ email });
        if (findauthor.userType !== "employer") return res.status(401).json({ message: "Unauthorized" });
        if (!findauthor) {
            return res.status(404).json({ message: "User not found" });
        }
        let { name, description, files, startDate, endDate, effortHours, categories } = req.body;
        let task = await Task.create({
            name, description, files, startDate, endDate, effortHours, taskStatus: TaskStatus.listed, categories, author: findauthor._id
        });
        res.status(200).json({ message: "Task created successfully", task });
    } catch (error) {
        next(error)
    }
}

const pushSubscribe = async (req, res, next) => {
    try {
        const sub = req.body.subscription;
        const payload = JSON.stringify({
            title: 'Voluntable',
            body: 'Notifications Activated',
            type: 'info'
        })

        const finduser = await User.findOneAndUpdate({ email: req.payload.aud },
            {
                $set: { webpushid: sub }
            });
        if (finduser) {
            webpush.sendNotification(sub, payload).catch((err) => console.error(err))
            res.send({ status: 'ok', message: 'subscriptions set' });
        } else {
            res.send({ status: 'error', message: 'subscriber not found' });
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createLoginUser, acceptTask,
    rejectTask, employerCreateLoginUser, createTask, pushSubscribe
}