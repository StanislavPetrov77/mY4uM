const production = false         // Enables some console.log() if false
const JWTexp = '2h'              //Token expiration time

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Post = require('../models/post')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const bcrypt = require('bcrypt')

let message = null

function getTokenData(req) {
    if (!req) return
    const token = req.split('token=')[1] // Needs better parsing...
    if (!token) return
    try {
        const tokenData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        return tokenData
    } catch(err) {
        // console.log(`getTokenData in the catch... ${err}`);
    }
}

async function cookieJwtAuth(req, res, next) {
    const tokenData = getTokenData(req.headers.cookie)
    if (!tokenData) {
        message = "You're not logged, please Log In:(Your token expired)"
        return res.redirect('/')
    }
    const user = await findUser({ id: tokenData.id })
    // console.log(`--- AUTH PASS - ${user.name} ${getDateTime()}`)
    if (!user) {
        message = "You're not logged, please Log In:(email not in the database)"
        return res.redirect('/')
    }
    next()
}

async function findUser(u) {
    try {
        const user = await User.findOne(u)
        return user
    } catch {
        console.error(`findUser o - in the catch...`);
    }
}

//------------------------------------------------------------------

///// INDEX

router.get('/', async (req, res) => {
    let posts = null
    let users = null
    try {
        posts = await Post.find();
        users = await User.find();
        // console.log(posts, users);
    } catch {
        message = 'Database search failed...'
    }
    res.render('posts', { posts: posts, users: users, message: message })
})

///// CREATE POST

router.get('/newPost', cookieJwtAuth, (req, res) => {
    res.render('newPost', { message: message })
})

router.post('/newPost', cookieJwtAuth, async (req, res) => {
    const tokenData = getTokenData(req.headers.cookie)
    const user = await findUser({ id: tokenData.id })
    const date = new Date()
    const post = new Post({
        uid: user.id,
        date: `${date.toLocaleTimeString()}, ${date.toLocaleDateString()}`,
        content: req.body.content,
    })
    try {
        const newPost = await post.save()
        message = `Post success!`
        user.posts += 1
        try {
            await User.findOneAndUpdate({ id: user.id }, { posts: user.posts })
        } catch {
            console.log('In the catch of update user!');
        }
        res.redirect('/')
    } catch {
        message = `Error posting message...`
        res.redirect('/')
    }
})

///// PROFILE

router.get('/profile', cookieJwtAuth, async (req, res) => {
    const tokenData = getTokenData(req.headers.cookie)
    const user = await findUser({ id: tokenData.id })
    res.render('profile', { user: user, message: message })
})

router.post('/profile', cookieJwtAuth, async (req, res) => {
    const tokenData = getTokenData(req.headers.cookie)
    const user = await findUser({ id: tokenData.id })

    try {
        if ((req.files)) {
            let avatar = req.files['profile-file']
            const newAvatar = user.id + '.' + avatar.name.split('.').slice(-1)
            avatar.mv('public/assets/avatars/' + newAvatar)
            // if size > 10k
            user.img = 'assets/avatars/' + newAvatar
        } else {
            message = `No file uploaded...`
        }
    } catch {
        message = 'Error saving avatar...'
        return res.redirect('/profile')
    }

    try {
        await User.findOneAndUpdate({ id: user.id }, { name: req.body.name,
                                                       email: req.body.email,
                                                       password: req.body.password,
                                                       img: user.img })
        message = 'Changes has been saved.'
    } catch {
        message = 'Error saving changes...'
    }
    return res.redirect('/profile')
})

///// SIGN UP

router.get('/signup', (req, res) => {
    res.render('./signup', { message: message })
})

router.post('/signup', async (req, res) => {
    let user
    user = await findUser({ email: req.body.email })
    if (user) {
        message = 'A user with that email exists. Please try again.'
        return res.render('signup', { message: message, name: req.body.name })
    }
    user = await findUser({ name: req.body.name })
    if (user) {
        message = 'A user with that name exists. Please try again.'
        return res.render('signup', { message: message, email: req.body.email })
    }

    const newUser = new User({
        id: uuid.v4(),
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        posts: 0,
        img: 'assets/Default user.jpg'
    })

// const hashedPassword = await bcrypt.hash(req.body.password, 10)

    bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err
            // newUser.password = hash
            newUser.save()
                .then(user => {
                    message = `You've signed up sucsessfuly!`
                    res.redirect('/login')
                })
                .catch( () => {
                    message = `Error signing up...`
                    res.render('signup')
                })
        }))
})

///// LOG IN

router.get('/login', (req, res) => {
    res.render('login', { message:message })
})

router.post('/login', async (req, res) => {
    const user = await findUser({ email: req.body.email })

    if ((!user) || (user.password !== req.body.password)) {
        message = 'Email or password incorrect! Try again.'
        return res.render('login', { message: message, email: req.body.email })
    }

    const tokenData = { id: user.id, name: user.name, email: user.email }
    const token = jwt.sign(tokenData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: JWTexp })

    res.cookie("token", token, { httpOnly: true })
    message = `Successful Log In as ${user.name}`
    res.redirect('/profile')
})

///// LOG OUT

router.get('/logout', (req, res) => {
    res.clearCookie("token")
    message = `Succesfully loged out...`
    res.redirect('/')
})


function getDateTime(date) {
    if (!date) date = new Date()
    return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()}, ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
}

module.exports = router