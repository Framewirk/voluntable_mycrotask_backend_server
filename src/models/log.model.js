const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    requestMethod: {
        type: String,
        required: true,
    },
    requestUrl: {
        type: String,
        required: true,
    },
    requestIp: {
        type: String,
        required: true,
    },
    requestTime: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'logs' });

const Log = mongoose.model('logs', logSchema);
module.exports = Log