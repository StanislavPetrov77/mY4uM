if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const indexRouter = require('./routes/indexRouter')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const usersDB = mongoose.connection
const postsDB = mongoose.connection
// usersDB.dropDatabase()
// postsDB.dropDatabase()

usersDB.on('error', error => console.error(error))
usersDB.once('open', () => console.log('usersDB connected to Mongoose'))
postsDB.on('error', error => console.error(error))
postsDB.once('open', () => console.log('postsDB connected to Mongoose'))

app.use('/', indexRouter)
app.use(express.urlencoded({ extended: false }))

app.listen(process.env.PORT || 5000)
console.log('Port: 5000')