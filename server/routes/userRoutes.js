const express = require('express');
const {registerUser, authUser, allUsers} = require('../controllers/userControllers')
const {protect} =  require('../middleware/authMiddleware')

const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers); //first the protect middleware called
//this middleware is used to verify the token
router.post('/login', authUser);

module.exports = router