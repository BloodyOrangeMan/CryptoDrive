const express = require('express');
const fileController = require('../controllers/fileController');
const authController = require('./../controllers/authController');
const router = express.Router();


router.post('/upload', authController.protect, fileController.uploadFiles);
router.get('/getall', authController.protect, fileController.getAll);
router.get('/download/:name', authController.protect, fileController.download);
router.delete('/delete/:name', authController.protect, fileController.delete);


module.exports = router;