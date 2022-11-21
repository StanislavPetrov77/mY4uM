const production = false         // Enables some console.log() if false
const JWTexp = '2h'              //Token expiration time

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const jwt = require('jsonwebtoken')

let message = null

///// INDEX

router.get('/', async (req, res) => {
    let posts = null
    try {
        posts = await Post.find();
    } catch {
        message = 'Database search failed...'
    }
    res.render('index', { posts: posts, message: message })
})

///// PROFILE

router.get('/profile', cookieJwtAuth, async (req, res) => {
    const tokenData = getTokenData(req.headers.cookie)
    const user = await findUser(tokenData.email)
    res.render('profile', { user: user, message: message })
})

router.post('/profile', cookieJwtAuth, async (req, res) => {
    const tokenData = getTokenData(req.headers.cookie)
    const user = await findUser(tokenData.email)
    try {
        await User.findOneAndUpdate({ id: user.id }, { name: req.body.name, email: req.body.email, password: req.body.password })
    } catch {
        console.log('In the catch of update user!');
    }
    message = 'Received "Save changes" request...'
    res.redirect('/profile')
})

///// SIGN UP

router.get('/signup', (req, res) => {
    res.render('./signup', { message: message })
})

router.post('/signup', async (req, res) => {
    const user = await findUser(req.body.email)
    if (user) {
        message = 'A user with that email exists. Please try again.'
        return res.render('signup', { message: message })
    }
    const newUser = new User({
        id: Date.now(),
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        img: 'assets/Default user.jpg'
    })

    try {
        await newUser.save()
        message = `You've signed up sucsessfuly!`
        res.redirect('/login')
    } catch {
        message = `Error signing up...`
        res.render('signup')
    }
})

///// LOG IN

router.get('/login', (req, res) => {
    res.render('login', { message:message })
})

router.post('/login', async (req, res) => {
    const user = await findUser(req.body.email)

    if (!user) {
        message = 'Email or password incorrect! Try again.U'
        return res.render('login', { message: message })
    }

    if (user.password !== req.body.password) {
        message = 'Email or password incorrect! Try again.P'
        return res.render('login', { message: message })
    }

    const tokenData = {email: user.email}
    const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: JWTexp })

    res.cookie("token", token, { httpOnly: true })
    message = `Successful Log In as ${user.name}`
    res.redirect('/')
})

///// LOG OUT

router.get('/logout', (req, res) => {
    res.clearCookie("token")
    message = `Succesfully loged out...`
    res.redirect('/')
})

///// CREATE POST

router.get('/createPost', cookieJwtAuth, (req, res) => {
    res.render('createPost', { message: message })
})

router.post('/createPost', cookieJwtAuth, async (req, res) => {
    const tokenData = getTokenData(req.headers.cookie)
    const user = await findUser(tokenData.email)
    const post = new Post({
        name: user.name,
        img: user.img,
        date: getDateTime(),
        content: req.body.content,
        votes: 0
    })
    try {
        const newPost = await post.save()
        message = `Post success!`
        res.redirect('/')
    } catch {
        message = `Error posting message...`
        res.redirect('/')
    }
})

//------------------------------------------------------------------


async function findUser(email) {
    try {
        const user = await User.findOne({email: email})
        // console.log(`findUser - user found: ${user.name}`);
        return user
    } catch {
        console.log(`findUser - in the catch...`);
    }
}


function getTokenData(req) {
    if (!req) return
    const token = req.split('token=')[1] // Needs better parsing...
    try {
        const tokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        return tokenData
    } catch(err) {
        console.log(`getTokenData - in the catch...`);
    }
}

async function cookieJwtAuth(req, res, next) {
    const tokenData = getTokenData(req.headers.cookie)
    if (!tokenData) {
        message = "You're not logged, please Log In:(no token)"
        return res.redirect('/')
    }
    const user = await findUser(tokenData.email)
    // if (!production) console.log(`--- AUTH PASS - ${user.name} ${getDateTime()}`)
    if (!user) {
        message = "You're not logged, please Log In:(email not in the database)"
        return res.redirect('/')
    }
    next()
}



// const hashedPassword = await bcrypt.hash(req.body.password, 10)







function getDateTime(date) {
    if (!date) date = new Date()
    return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}, ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
}



module.exports = router