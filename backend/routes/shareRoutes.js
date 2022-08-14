const express = require('express');
const shareController = require('../controllers/shareController');
const fileController = require('../controllers/fileController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.get('/:name',authController.protect,fileController.checkPassphrase,shareController.share)
router.get('/download/:token',authController.protect,shareController.shareDownload)

module.exports = router;