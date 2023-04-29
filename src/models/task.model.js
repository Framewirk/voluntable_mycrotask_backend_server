const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskStatus = {
    listed: 'listed',
    started: 'started',
    completed: 'completed',
    cancelled: 'cancelled',
}

const taskSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    files: {
        type: [String],
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    effortHours: {
        type: Number,
        required: true,
    },
    taskStatus: {
        type: String,
        enum: [TaskStatus.listed, TaskStatus.started, TaskStatus.completed, TaskStatus.cancelled],
        default: TaskStatus.listed,
        required: true,
    },
    volunteers: {
        type: [Schema.Types.ObjectId],
        ref: 'users',
    },
    rejectedBy: {
        type: [Schema.Types.ObjectId],
        ref: 'users',
    },
    categories: {
        type: [String],
    },
}, { collection: 'tasks' });

const Task = mongoose.model('tasks', taskSchema);
module.exports = Task;