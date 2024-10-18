const express = require('express');
const {registerUser, authUser, allUsers} = require('../controllers/userControllers')
const {protect} =  require('../middleware/authMiddleware')

const router = express.Router();

router.route('/').post(registerUser).get(protect, allUsers); //first the protect middleware called
//thsi middleware is used to very the token
router.post('/login', authUser);

module.exports = router