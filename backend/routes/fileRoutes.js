const express = require('express');
const fileController = require('../controllers/fileController');
const router = express.Router();


router.post('/upload', fileController.upload.single('file'), (req,res) => {
    console.log(req.body);
    res.status(201).json({
        status: 'success'
      });
});


module.exports = router;