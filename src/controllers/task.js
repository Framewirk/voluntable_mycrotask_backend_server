const Task = require('../models/task.model');
const User = require('../models/user.model');
const Certificate = require('../models/certificate.model');

const createTask = async (req, res, next) => {
    try {
        // Access req.payload here to get User Details - maybe for access control
        let user = await User.findOne({ email: req.payload.aud });
        if (!user) {
            throw new Error("User not found");
        }
        let task = await Task.create({ ...req.body, author: user._id });
        res.status(201).json({ status: "Ok", task });
    } catch (error) {
        next(error)
    }
}

const createTasks = async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.payload.aud });
        if (!user) {
            throw new Error("User not found");
        }
        let tasks = req.body;
        for (let i = 0; i < tasks.length; i++) {
            tasks[i]["author"] = user._id
        }
        await Task.insertMany(tasks);
        res.status(201).json({ status: "Ok", tasks });
    } catch (error) {
        next(error)
    }
}

const getNewTasks = async (req, res, next) => {
    try {
        // Access req.payload here to get User Details - maybe for access control
        let user = await User.findOne({ email: req.payload.aud });
        if (!user) {
            throw new Error("User not found");
        }
        let tasks = await Task.find({ volunteers: { $ne: user._id }, rejectedBy: { $ne: user._id }, taskStatus: "listed" });
        for (let i = 0; i < tasks.length; i++) {
            let findauthor = await User.findOne({ _id: tasks[i].author });
            tasks[i]["author"] = findauthor;
        }
        res.status(200).json({ tasks });
    } catch (error) {
        next(error)
    }
}

const getMyTasks = async (req, res, next) => {
    try {
        let email = req.payload.aud;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let tasks = await Task.aggregate([
            {
                $match: {
                    $or: [
                        { volunteers: user._id },
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $unwind: "$author"
            }
        ]);

        for(let i=0;i<tasks.length;i++){
            let findcerts = await Certificate.find({ userid: user._id, taskid: tasks[i]._id });
            for(let j=0;j<findcerts.length;j++){
                if(findcerts[j].certificateType==="participation"){
                    if(!tasks[i]["participation"]) tasks[i]["participation"] = [];
                    tasks[i]["participation"].push(findcerts[j]);
                }
                if(findcerts[j].certificateType==="completion"){
                    if(!tasks[i]["completion"]) tasks[i]["completion"] = [];
                    tasks[i]["completion"].push(findcerts[j]);
                }
            }
        }
        // let resp = [];
        // let tasks = await Task.find({ volunteers: user._id });
        // for(let i=0; i<tasks.length; i++){
        //     let findauthor = await User.findOne({_id: tasks[i].author});
        //     let findcerts = await Certificate.find({task: tasks[i]._id, userid: user._id});
        //     resp.push({...tasks[i], author: findauthor, certs: findcerts});
        // }
        res.status(200).json({ tasks });
    } catch (error) {
        next(error)
    }
}

const getPublishedTasks = async (req, res, next) => {
    try {
        let email = req.payload.aud;
        let user = await User.findOne({ email });
        if ((!user) || (user.userType !== "employer")) {
            return res.status(404).json({ message: "User not found" });
        }
        let tasks = await Task.aggregate([
            {
                $match: {
                    "author": user._id
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "volunteers",
                    foreignField: "_id",
                    as: "volunteers"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            {
                $unwind: "$author"
            }
        ]);
        for(let i=0;i<tasks.length;i++){
            let findcerts = await Certificate.find({ taskid: tasks[i]._id });
            for(let j=0;j<findcerts.length;j++){
                if(findcerts[j].certificateType==="participation"){
                    if(!tasks[i]["participation"]) tasks[i]["participation"] = [];
                    tasks[i]["participation"].push(findcerts[j]);
                }
                if(findcerts[j].certificateType==="completion"){
                    if(!tasks[i]["completion"]) tasks[i]["completion"] = [];
                    tasks[i]["completion"].push(findcerts[j]);
                }
            }
            // tasks[i]["certs"] = findcerts;
            // for(let j=0;j<findcerts.length;j++){
            //     if(findcerts[j].certificateType==="participation"){
            //         if(!tasks[i]["participation"]) tasks[i]["participation"] = [];
            //         tasks[i]["participation"].push(findcerts[j]);
            //     }
            //     if(findcerts[j].certificateType==="completion"){
            //         if(!tasks[i]["completion"]) tasks[i]["completion"] = [];
            //         tasks[i]["completion"].push(findcerts[j]);
            //     }
            // }
        }
        res.status(200).json({ tasks });
    } catch (error) {
        next(error)
    }
}

const updateStatus = async (req, res, next) => {
    try {
        const { taskId, status } = req.body;
        let email = req.payload.aud;
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let task = await Task.findOne({ _id: taskId });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        if (task.author.toString() !== user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        task.taskStatus = status;
        await task.save();
        res.status(200).json({ task });
    } catch (error) {
        next(error)
    }
}

module.exports = { createTask, createTasks, getNewTasks, getMyTasks, getPublishedTasks, updateStatus }