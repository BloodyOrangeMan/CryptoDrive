const express = require('express');
const fileController = require('../controllers/fileController');
const authController = require('./../controllers/authController');
const router = express.Router();


router
    .route('/')
    .post(authController.protect, fileController.checkType, fileController.checkPassphrase, fileController.uploadFiles)
    .get(authController.protect, fileController.getAll);

router
    .route('/:name')
    .get(authController.protect, fileController.checkPassphrase,fileController.download)
    .delete(authController.protect, fileController.delete);

module.exports = router;