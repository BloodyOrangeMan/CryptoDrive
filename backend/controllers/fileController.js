const mongoose = require('mongoose');
const {GridFsStorage} = require('multer-gridfs-storage');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const util = require("util");
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwtDecoder = require('jwt-decode')
const fs = require('fs');

const DB = process.env.DATABASE_LOCAL;

const conn = mongoose.createConnection(DB);

// Init gfs
let gridfsBucket;

let id;

conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
})

// Create storage engine
const storage = new GridFsStorage({
  url: DB,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: {
            id:id,
            info:req.body
          }
        };
        resolve(fileInfo);
      });
    });
  }
});


const upload = util.promisify(multer({ storage }).single("file"));

exports.getToken = catchAsync(async (req, res, next) => {
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  id = jwtDecoder(token).id;

  console.log(id);

  next();

});

exports.uploadFiles = catchAsync(async (req, res) => {
  try {
    await upload(req, res);
    if (req.file == undefined)  {
      return new AppError('Please provide a file!', 400);
    }
    res.status(201).json({
      status: 'success'
    });

  } catch (error) {
    console.log(error);
    return new AppError('Oops, Something went wrong!', 400);
  }
});

exports.getAll = catchAsync(async (req, res) => {
  gridfsBucket.find().toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.status(404).json({
        status: 'failed'
      })
    } else {
      files.map(file => {
        if (
          file.contentType === 'image/jpeg' ||
          file.contentType === 'image/png'
        ) {
          file.isImage = true;
        } else {
          file.isImage = false;
        }
      });
      res.status(200).json({
        status: 'success',
        files: files
      })
    }
  });
})

exports.download = catchAsync(async (req, res) => {

  console.log('ok');

  const name = req.params.name;

  let type;

  await gridfsBucket.find({filename: name}).toArray((err, files) =>{
    type = files[0].contentType;
    res.set({
      "Accept-Ranges": "bytes",
      "Content-Disposition": `attachment; filename=${name}`,
      "Content-Type": `${type}`
    });;
  });

  const downloadStream = await gridfsBucket.openDownloadStreamByName(name);

  downloadStream.pipe(res);

})