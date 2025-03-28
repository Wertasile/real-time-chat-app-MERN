const asyncHandler = require("express-async-handler");
const User = require("../Models/userModel")
const generateToken = require("../config/generateToken")


//1
const registerUser = asyncHandler(async (req,res) => {
    const { name, email, password, pic} = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please Enter all fields")
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error("uSER ALREADY EXISTS")

    }

    const user = await User.create({
        name,
        email,
        password,
        pic,
    })

    if (user) {
        res.status(201).json({
            _id : user._id,
            name : user.name,
            email : user.email,
            pic : user.pic,
            token : generateToken(user._id)
        })
    }else{
        res.status(400)
        throw new Error("Failed to Create the User")
    }
})

//2
const authUser = asyncHandler(async(req,res) => {
    const { email, password} = req.body

    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(password)))  // user.matchPassword is an asynchronous function declared in the userModel
        {
        res.json({
            _id : user._id,
            name : user.name,
            email : user.email,
            pic : user.pic,
            token : generateToken(user._id)
        })
    }else{
        res.status(400)
        throw new Error("Invalid email or password")
    }
})

//3 : /api/user?search=arfan
const allUsers = asyncHandler( async (req,res) => {
    const keyword = req.query.search ? {
        $or: [                                         // mongoDB command
            { name : { $regex: req.query.search, $options: "i"}},
            { email : { $regex: req.query.search, $options: "i"}}
        ]
    } : {

    }

    const users = await User.find(keyword) // .find({_id:{$ne:req.user._id}})  // return every other user that is not equal (ne) to current user (search result)
    res.send(users)
    
})

module.exports = { registerUser, authUser, allUsers }