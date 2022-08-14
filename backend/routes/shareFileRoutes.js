const express = require('express');
const shareFileController = require('../controllers/shareFileController');
const authController = require('../controllers/authController');
const router = express.Router();


router
    .route('/makelink/:name')
    .post(authController.protect, shareFileController.checkPassphrase, shareFileController.uploadFiles)

router
    .route('/:name')
    .get(authController.protect, shareFileController.download)

module.exports = router;