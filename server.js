if (process.env.NODE_ENV !== 'production') { require('dotenv').config() }

const express = require('express')
const app = express()

const expressLayouts = require('express-ejs-layouts')
const fileUpload = require('express-fileupload')
// const bodyParser = require('body-parser')
// const cors = require('cors')
// const morgan = require('morgan')

const jwt = require('jsonwebtoken')

app.use(expressLayouts)
app.use(express.static('public'))

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')

app.use('/favicon.ico', express.static('public/assets/favicon.ico'));

app.use(fileUpload({createParentPath: true}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.use(morgan('dev'))
// app.use(cors())


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const usersDB = mongoose.connection
const postsDB = mongoose.connection
// usersDB.once('open', () => console.log('usersDB connected to Mongoose'))
// postsDB.once('open', () => console.log('postsDB connected to Mongoose'))
// usersDB.on('error', error => console.error(error))
// postsDB.on('error', error => console.error(error))
// usersDB.dropDatabase()
// postsDB.dropDatabase()

app.use('/', require('./routes/indexRouter'))
app.listen(process.env.PORT || 5000, console.log('Server is listening on PORT: 5000'))