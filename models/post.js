const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    img: {
        type: String
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