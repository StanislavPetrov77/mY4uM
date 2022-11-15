const production = false         // Enables some console.log() if false
const JWTexp = '2h'             //Token expiration time

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const jwt = require('jsonwebtoken')
const { session } = require('passport')

const sessions = []
let message = null

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find();
        if (posts) {
            res.render('index', { posts: posts, message: message })
        } else {
            message = 'Nothing posted yet...'
            res.render('index', { posts: posts, message: message})
        }
    } catch {
        message = 'Database search failed...'
        res.render('index', { message: message })
    }
})

router.get('/profile', cookieJwtAuth, (req, res) => {
    const userInSession = getUserInSessions(req.headers.cookie)
    res.render('profile', { user: userInSession })
})

router.get('/signup', (req, res) => {
    res.render('./signup')
})

router.post('/signup', async (req, res) => {
    const newUser = new User({
        id: Date.now(),
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        img: 'assets/img1.jpg'
    })

    try {
        const u = await newUser.save()
        message = `You've signed up sucsessfuly!`
        res.redirect('/login')
    } catch {
        message = `Error signing up...`
        res.render('signup')
    }
})

router.get('/login', (req, res) => {

    res.render('login')
})

router.post('/login', async (req, res) => {
    let user = null
    try {
        user = await User.findOne({email: req.body.email, password: req.body.password})
    } catch {
        message = 'Error while connecting to database...'
        return res.render('login', { message: message })
    }
    if (!user) {
        message = 'Email or password incorrect! Try again.'
        return res.render('login', { message: message })
    }

    const tokenData = {id: user.id, name: user.name, email: user.email, img: user.img}

    const token = jwt.sign({ tokenData: tokenData }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: JWTexp })
    sessions.push({ token: token, tokenData: tokenData , timestamp: Date.now() })

    res.cookie("token", token, { httpOnly: true })
    message = `Successful Log In. User: ${user.name}`
    res.redirect('/')
})

function getHeaderToken(req) {
    if (!req) return null
    const token = req.split('token=')[1] // Needs better parsing...
    // if (!production) console.log(`Cookie found:   ${req}`)
    // if (!production) console.log(`Parsed   token:       ${token}`)
    // if (!production) console.log(sessions)
    return token
}

function getUserInSessions (req) {
    const token = getHeaderToken(req)
    const u = sessions.find(o => o.token = token)
    return u ? u.tokenData : null
}

function getUserIndexInSessions (req) {
    const token = getHeaderToken(req)
    const i = sessions.findIndex(o => o.token = token)
    return i ? i : null
}

function cookieJwtAuth(req, res, next) {
    const token = getHeaderToken(req.headers.cookie)
    if (!token) {
        message = "You're not logged, please Log In:"
        return res.redirect('/')  
    }
    let user = null
    try {
        user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch(err) {
        message = err;
        return res.redirect('/')
    }
    if (!production) console.log(`--- AUTH PASS - ${user.tokenData.name}`)
    next()
}

router.get('/createPost', cookieJwtAuth, (req, res) => {
    res.render('createPost.ejs')
})

router.post('/createPost', cookieJwtAuth, async (req, res) => {
    const userInSession = getUserInSessions(req.headers.cookie)
    const post = new Post({
        name: userInSession.name,
        img: userInSession.img,
        date: Date(),
        content: req.body.content
    })
    if (!production) console.log(userInSession);
    try {
        const newPost = await post.save()
        message = `Post success!`
        res.redirect('/')
    } catch {
        message = `Error posting message...`
        res.redirect('/')
    }
})

router.get('/logout', (req, res) => {
    sessions;
    res.clearCookie("token")
    message = `Succesfully loged out...`
    res.redirect('/')
})

// const hashedPassword = await bcrypt.hash(req.body.password, 10)

module.exports = router