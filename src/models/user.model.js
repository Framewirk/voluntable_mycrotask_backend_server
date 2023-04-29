const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserType = {
    employer: 'employer',
    volunteer: 'volunteer',
    admin: 'admin'
}

const userSchema = new Schema({
    fullName: {
      type: String,
      required: true,
    },
    organization: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    userType: {
        type: String,
        enum: [UserType.employer, UserType.volunteer, UserType.admin],
        required: true,
    },
    phone: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    webpushid: {
        type: Object,
    },
  }, { collection: 'users' });

  userSchema.methods.validateToken = async function(token) {

  }
  
  const User = mongoose.model('users', userSchema);
  
  module.exports = User;