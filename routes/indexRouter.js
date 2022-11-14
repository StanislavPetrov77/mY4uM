const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const jwt = require('jsonwebtoken')

const session = []

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
        if (posts != null) {
            res.render('index', { posts: posts })
        } else {
            res.render('index', { message: 'Nothing posted yet...' })
        }
    } catch {
        res.render('index', { message: 'Database search failed...' })
    }
})

router.get('/profile', cookieJwtAuth, (req, res) => {
    res.render('./profile', { user: loggedUser})
})

router.get('/signup', (req, res) => {
    res.render('./signup')
})

router.post('/signup', async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    })

    try {
        const newUser = await user.save()
        res.redirect('./login')
    } catch {
        res.render('/')
    }
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email, password: req.body.password})
        if (user != null) {
            // console.log(user);
            const token = jwt.sign(JSON.stringify(user), process.env.ACCESS_TOKEN_SECRET)
            res.cookie("token", token, {
                httpOnly: true
            })
        } else {
            res.clearCookie("token")
        }
        res.redirect('/')
    } catch {
        res.redirect('login')
    }
})

function cookieJwtAuth(req, res, next) {
    try {
        const token = req.headers.cookie.split('=')[1]
        // console.log(req.headers.cookie.split('=')[1]);
        try {
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            if (user == null) { res.redirect('/')}
            req.user = user
            next()
        } catch (err) {
            res.clearCookie("token")
            res.redirect('/')
        }
    } catch {
        res.redirect('/')
    }
}

router.get('/createPost', cookieJwtAuth, (req, res) => {
    res.render('createPost')
})

router.post('/createPost', cookieJwtAuth, async (req, res) => {
    const post = new Post({
        name: 'placeholder',
        img: 'assets/img1.jpg',
        date: Date(),
        content: req.body.content
    })

    try {
        const newPost = await post.save()
        res.redirect('./')
    } catch {
        res.redirect('./')
    }

})

router.get('/logout', (req, res) => {
    res.clearCookie("token")
    res.redirect('/')
})

// const hashedPassword = await bcrypt.hash(req.body.password, 10)

module.exports = router