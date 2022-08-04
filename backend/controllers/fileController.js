const mongoose = require('mongoose');
const {GridFsStorage} = require('multer-gridfs-storage');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const util = require("util");
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwtDecoder = require('jwt-decode')


const DB = process.env.DATABASE_LOCAL;

const conn = mongoose.createConnection(DB);

// Init gfs
let gridfsBucket;


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
        const id =  jwtDecoder(req.cookies.jwt).id
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
  const id = jwtDecoder(req.cookies.jwt).id
  gridfsBucket.find({'metadata.id':id}).toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.status(404).json({
        status: 'failed'
      })
    } else {
      res.status(200).json({
        status: 'success',
        files: files
      })
    }
  });
})

exports.download = catchAsync(async (req, res, next) => {

  const name = req.params.name;

  const id = jwtDecoder(req.cookies.jwt).id;

  await gridfsBucket.find({'metadata.info.fileName': name})
  .toArray((err, files) =>{
    if (!files || files.length === 0) {
     return next(new AppError('Not found!', 404));
    }
    if(files[0].metadata.id != id) {
      new next(AppError('Permission denied!', 403));
    }
    const fileID = files[0]._id;
    const type = files[0].contentType;
    res.set({
      "Accept-Ranges": "bytes",
      "Content-Disposition": `attachment; filename=${name}`,
      "Content-Type": `${type}`
    });

    downloadStream = gridfsBucket.openDownloadStream(fileID);
    downloadStream.pipe(res);
  });

})

exports.delete = catchAsync(async (req, res, next) => {
  
  const name = req.params.name;

  const id = await jwtDecoder(req.cookies.jwt).id;

  await gridfsBucket.find({'metadata.info.fileName': name})
  .toArray((err, files) =>{
    if (!files || files.length === 0) {
      return next(new AppError('Not found!', 404));
    }
    if(files[0].metadata.id != id) {
      console.log(files[0].metadata.id);
      console.log(id);
      return new next(new AppError('Permission denied!', 403));
    }
    
    const fileID = files[0]._id;
    
    gridfsBucket.delete(fileID);

    res.status(200).json({ status: 'success' });
  });

})