const axios = require('axios');
const moment = require('moment');
const fs = require('fs');

const Certificate = require('../models/certificate.model');

let baseURL = process.env.CERTIFICATE_BASE_API;

const generateCertificate = async (type, data) => {
    try {
        let req = {
            certificateAuthor: data.author.fullName,
            taskDescription: data.task.description,
            taskDuration: (`${data.task.effortHours} Hours`),
            taskStartDate: moment(data.task.startDate).format("YYYY-MM-DD"),
            taskTitle: data.task.name,
            volunteerEmail: data.volunteer.email,
            volunteerName: data.volunteer.fullName
        }
        let response = await axios.post(`${baseURL}/api/v1/${type}`, req, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        if (response.data.responseCode === "OK") {
            let certificate = await Certificate.create({
                certificateType: type === "ParticipationCertificate" ? "participation" : "completion",
                certificateId: response.data.result[type].osid,
                taskid: data.task._id,
                userid: data.volunteer._id,
                link: `https://api.onedelhi.voluntable.com/v1/certificate/cert/${response.data.result[type].osid}`
            });
            return certificate;
        }

    } catch (error) {
        throw new Error(error);
        // console.log(error);
    }
}

const downloadCertificate = async (id, res) => {
    try {
        let findCertificate = await Certificate.findOne({ certificateId: id });
        if (!findCertificate) {
            throw new Error("Certificate not found");
        }
        let certType = findCertificate.certificateType === "participation" ? "ParticipationCertificate" : "CompletionCertificate";
        // console.log(`${baseURL}/api/v1/${certType}/${id}`);
        let response = await axios.get(`${baseURL}/api/v1/${certType}/${id}`, {
            headers: {
                "Content-Type": "application/pdf",
                'Accept': 'application/pdf'
            },
            responseType: 'stream'
        });
        response.data.pipe(res);
    } catch (error) {
        console.log(error)
        // throw new Error(error);
    }
}

module.exports = { generateCertificate, downloadCertificate };