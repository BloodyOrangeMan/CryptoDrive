const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/isLoggedIn', authController.isLoggedIn);
router.get('/logout', authController.logout);


module.exports = router;