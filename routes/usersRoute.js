const { User } = require('../models/userModel');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// constants
const secret = process.env.SECRET
const salt = process.env.SALT

// get all users
router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash')

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

// get users by id
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if (!user) {
        return res.
        status(500)
            .send({
                message: "Category with the given ID does not exist.",
                success: false
            })
    } else {
        return res
            .send(user);
    }
})

// register user
router.post('/register', async (req, res) => {
    let user = User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, parseInt(salt)),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })
    user = await user.save()
    if (!user) {
        return res
            .status(404)
            .send({
                message: "The user could not be registered.",
                success: false
            })
    } else {
        return res.
        status(200).
        send(user)
    }
})

// login user
router.post('/login', async (req, res) => {
    const user = await User.findOne({email : req.body.email})
    try {
        if(!user) {
            return res.
            status(400).
            send({
                message : "User not found",
                authentication : false
            })
        }
        else{
            if(bcrypt.compareSync(req.body.password, user.passwordHash)){
                const token = jwt.sign({
                    userId : user.id,
                    userName : user.name,
                    isAdmin : user.isAdmin
                },
                secret,
                {
                    expiresIn : '1d'
                }
                )
                return res.
                status(200).
                send({
                    message : `Welcome back ${user.name}`,
                    userToken : token,
                    authentication : true
                })
            }
            else{
                return res.
                status(400).
                send({
                    message : "Incorrect Password",
                    authentication : false
                })
            }
        }
    }
    catch(err){
        return res
        .status(400).
        send({
            message : "Something went wrong",
            authentication : false
        })
    }
})

module.exports = router;