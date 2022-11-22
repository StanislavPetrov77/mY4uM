const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Post', postSchema)