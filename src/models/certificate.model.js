const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CertType = {
    participation: 'participation',
    completion: 'completion',
}

const certificateSchema = new Schema({
    certificateType: {
        type: String,
        enum: [CertType.participation, CertType.completion],
        required: true,
    },
    certificateId: {
        type: String,
        required: true,
    },
    taskid: {
        type: Schema.Types.ObjectId,
        ref: 'tasks',
        required: true,
    },
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    link: {
        type: String,
        required: true,
    },
}, { collection: 'certificates' });

const Certificate = mongoose.model('certificates', certificateSchema);
module.exports = Certificate