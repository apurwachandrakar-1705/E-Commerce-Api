const express = require('express')
const { User } = require('../models/user')
const router = express.Router()
const bcrypt= require("bcryptjs")
const jwt = require("jsonwebtoken")
router.get('/', async (req, res) => {
    const userList = await User.find().select("-passwordHash")
    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList)
})
router.get('/:id',async(req,res)=>{
    const user = await User.findById(req.params.id).select("-passwordHash")

    if(!user){
        return res.status(500).json({msg:"the user with given id is not found"})
    }
    res.status(200).send(user)
})
router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
       
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save()
    if (!user) {
        return res.status(400).send('the user cannot be created!!')
    }
    res.send(user)
})

router.post('/login',async(req,res)=>{
    const user = await User.findOne({email:req.body.email})
    const secret = process.env.secret
    if(!user){
        return res.status(400).send("The user is not exist")
    }
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash)){
        const token =  jwt.sign({
            userId:user.id,
            isAdmin:user.isAdmin
        },secret,{expiresIn:'1d'})
return res.status(200).send({user:user.email,token})
    }
    else{
        return res.status(400).send("Password not matched....")
    }
})

router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
       
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    user = await user.save()
    if (!user) {
        return res.status(400).send('the user cannot be created!!')
    }
    res.send(user)
})
router.get('/get/count', async (req, res) => {
    try {
        const userCount = await User.countDocuments() // Remove the callback here
        res.send({ count: userCount })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
})
router.delete('/:id', (req, res) => {
    User.findByIdAndDelete(req.params.id)
        .then((user) => {
            if (user) {
                return res
                    .status(200)
                    .json({ success: true, msg: 'user is deleted' })
            } else {
                return res
                    .status(404)
                    .json({ success: false, msg: 'user not found' })
            }
        })
        .catch((err) => res.status(400).json({ success: false, error: err }))
})
module.exports = router
