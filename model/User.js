const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email:{
        type: String
    },
    name: {
        type: String
    },
    password: {
        type: String,
        maxLength: 100,
        require: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = User = mongoose.model('User', UserSchema);