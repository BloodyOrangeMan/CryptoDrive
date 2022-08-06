const mongoose = require('mongoose');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwtDecoder = require('jwt-decode');
const stream = require('stream');
const {fromBuffer} = require('file-type');

const whiteList = process.env.WHITELIST_TYPE.split(", ");

const DB = process.env.DATABASE_LOCAL;

const conn = mongoose.createConnection(DB);

// Init gfs
let gridfsBucket;


conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads'
  });
})

exports.checkType = catchAsync(async (req, res, next) => {
  
  const fileTypeFromBuffer = await fromBuffer(req.files.file.data);
  if (req.files == null)  {
    return next(new AppError('Please provide a file!', 400));
  }
  if (!whiteList.includes(fileTypeFromBuffer.mime)) {
    return next(new AppError('File type not allowed', 415));
  };

  next();
})

exports.uploadFiles = catchAsync(async (req, res, next) => {
    
    const {name, data, size, mimetype, md5} = req.files.file;
    const id =  jwtDecoder(req.cookies.jwt).id
  
    const bufferStream = new stream.PassThrough();
    bufferStream.end(data);
    //TODO ENCRYPT

    bufferStream.pipe(gridfsBucket.openUploadStream(name, {
      chunkSizeBytes: size,
      contentType:mimetype,
      metadata: {
        id,
        md5,
        info:req.body
      }
    }));

    res.status(200).json({ status: 'success' });
})


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