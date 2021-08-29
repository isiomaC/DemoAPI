const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    name:{
        type: String
    },
    link: {
        type: String
    },
    description: {
        type: String
    },
    previews:[{
        type: String
    }],
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = Project = mongoose.model('Project', ProjectSchema);