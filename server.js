if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const expressLayouts = require('express-ejs-layouts')

const indexRouter = require('./routes/index')

const users = []

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))

// console.log(process.env.DATABASE_URL);

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL)
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))


app.use('/', indexRouter)

app.use(express.urlencoded({ extended: false}))


app.get('/signup', (req, res) => {
    res.render('signup.ejs')
})

app.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/signup')
    }
    console.log(users);
    
})

app.get('/login', (req, res) => {
    res.render('login.ejs')
})


app.post('/login', (req, res) => {
    //res.send()
})

app.get('/profile', (req, res) => {
    res.render('profile.ejs', { username: 'Ljubljana'})
})

app.listen(process.env.PORT || 5000)
console.log(`Server listening on port ${process.env.PORT || 5000}...`)