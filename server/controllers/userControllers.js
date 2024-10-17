//ypically, when using async/await, unhandled errors might not be caught if you don't use 
//try/catch blocks around the asynchronous code. To avoid this and streamline error handling in 
//asynchronous functions, async handlers are used to automatically catch any errors thrown in 
//asynchronous functions and pass them to an error-handling middleware.

const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

const registerUser = asyncHandler(async(req, res)=>{
    const {name, email, password, pic} = req.body;

    if(!name || !email || !password){
        res.status(400).json({
            message: 'please enter all the details'
        })
    }

    //now check if teh user already exists
    const userExists = await User.findOne({ email });

    if(userExists){
        res.status(400).json({
            message: 'user already exists'
        })
    }

    const user = await User.create({
        name,
        email,
        password,
        pic
    });

    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    }else{
        res.status(400).json({
            message: 'error creating user'
        })
    }
})

const authUser = asyncHandler(async(req,res)=>{
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if (user && (await user.matchPassword(password))){
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id)
        })
    } else {
        res.status(401).json({
            message: 'password is incorrect'
        })
      }
})

module.exports = {registerUser, authUser};

//1. module.exports = { something }
//This syntax is used to export an object containing one or more properties or functions. 
//You can export multiple things by adding them as properties of the object.
// file: mathOperations.js
// const add = (a, b) => a + b;
// const subtract = (a, b) => a - b;
// module.exports = { add, subtract };

//2. module.exports = something
//This syntax is used when you want to export a single function, object, or value. 
//It replaces the entire module.exports with whatever something is.
// file: calculator.js
// const calculator = {
//     add: (a, b) => a + b,
//     subtract: (a, b) => a - b
//   };  
//   module.exports = calculator;
  