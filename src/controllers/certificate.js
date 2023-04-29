const Certificate = require('../models/certificate.model');
const User = require('../models/user.model');
const Task = require('../models/task.model');

const { generateCertificate, downloadCertificate } = require('../helpers/certificategen');

const getMyCertificates = async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.payload.aud });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        let certificates = await Certificate.find({ volunteer: user._id });
        res.status(200).json({ certificates });
    } catch (error) {
        next(error)
    }
}

const getCerts = async (req, res, next) => {
    try {
        const { taskId } = req.body;
        let email = req.payload.aud;
        let findauthor = await User.findOne({ email });
        if (!findauthor) {
            return res.status(404).json({ message: "User not found" });
        }
        let task = await Task.findOne({ _id: taskId });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        let certificates = await Certificate.find({ taskId: taskId });
        res.status(200).json({ certificates });
    } catch (error) {
        next(error)
    }
}

const getCertificate = async (req, res, next) => {
    try {
        let { certificateId } = req.params;
        let certificate = await Certificate.findOne({ certificateId });
        if (!certificate) {
            return res.status(404).json({ message: "Certificate not found" });
        }
        downloadCertificate(certificate.certificateId, res);
    } catch (error) {
        next(error)
    }
}

const issueCompletion = async (req, res, next) => {
    try {
        let user = await User.findOne({ email: req.payload.aud });
        if (!user || user.userType !== "employer") {
            return res.status(401).json({ message: "User not found" });
        }
        let { volunteerId, taskId } = req.body;
        let volunteer = await User.findOne({ _id: volunteerId });
        if (!volunteer || volunteer.userType !== "volunteer") {
            return res.status(404).json({ message: "Volunteer not found" });
        }
        let certificate = await Certificate.findOne({ userid: volunteerId, taskid: taskId, certificateType: "completion" });
        if (certificate) {
            return res.status(409).json({ message: "Certificate already issued" });
        }
        let task = await Task.findOne({ _id: taskId });
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }
        generateCertificate("CompletionCertificate", { volunteer, task: task, author: user });
        res.status(200).json({ message: "Certificate issued successfully" });
    } catch (error) {
        next(error)
    }
}

const searchCertificates = async (req, res, next) => {
    try {
        let { search } = req.body;
        let certificates = await Certificate.aggregate([
            {
                $match: {
                    $or: [
                        { certificateId: { $regex: search, $options: "i" } },
                    ]
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userid",
                    foreignField: "_id",
                    as: "volunteer",
                },
            },
            {
                $unwind: "$volunteer",
            },
            {
                $lookup: {
                    from: "tasks",
                    localField: "taskid",
                    foreignField: "_id",
                    as: "task",
                },
            },
            {
                $unwind: "$task",
            },
            {
                $lookup: {
                    from: "users",
                    localField: "task.author",
                    foreignField: "_id",
                    as: "author",
                },
            },
            {
                $unwind: "$author",
            },
        ]);

        // let certificates = await Certificate.find({ certificateId: new RegExp(search, 'g') }).sort({ $natural: 1 });
        res.status(200).json({ certificates });
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getMyCertificates,
    getCerts,
    getCertificate,
    issueCompletion,
    searchCertificates
}