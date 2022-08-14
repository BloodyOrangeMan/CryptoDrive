const express = require('express');
const shareController = require('../controllers/shareController');
const fileController = require('../controllers/fileController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/:name',authController.protect,fileController.checkPassphrase,shareController.share)
router.get('/download/:token',shareController.shareDownload)
router.get('/info/:key',shareController.getShareFileInfo)

module.exports = router;