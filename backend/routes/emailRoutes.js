const express = require('express');
const router = express.Router();
const emailController = require('./../controllers/emailController');

router.post('/sendcode', emailController.sendCode);
router.post('/resetPsw', emailController.resetPsw);


module.exports = router;
