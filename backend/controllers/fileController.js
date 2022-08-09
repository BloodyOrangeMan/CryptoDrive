/**
 * @file Controller for handling user requests for file operations
 */
const mongoose = require("mongoose");
const jwtDecoder = require("jwt-decode");
const stream = require("stream");
const { fromBuffer } = require("file-type");

const User = require("../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { encryptStream, decryptStream, signStream, openSignStream } = require("./../utils/cryptoFeatures");

const whiteList = process.env.WHITELIST_TYPE.split(", ");
const DB = process.env.DATABASE_LOCAL;
const conn = mongoose.createConnection(DB);

// Init gfs
let gridfsBucket;

conn.once("open", () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});

/**
 * A Middleware that checks for user upload file types, based on the Binary Magic Number
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @author BloodyOrangeMan
 */
exports.checkType = catchAsync(async (req, res, next) => {
  const fileTypeFromBuffer = await fromBuffer(req.files.file.data);
  if (req.files == null) {
    return next(new AppError("Please provide a file!", 400));
  }
  if (!whiteList.includes(fileTypeFromBuffer.mime)) {
    return next(new AppError("File type not allowed", 415));
  }

  next();
});

/**
 * Encrypt user uploaded files using Xchacha20Poly1305 algorithm, 
 * generate encryption key using passphrase entered by user, 
 * store buffer to MongoDB using GridFS.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @author BloodyOrangeMan
 */
exports.uploadFiles = catchAsync(async (req, res, next) => {
  const { name, data, size, mimetype, md5 } = req.files.file;
  const id = jwtDecoder(req.cookies.jwt).id;
  
  const storageData = await encryptStream(data, "123456");

  const bufferStream = new stream.PassThrough();
  bufferStream.end(storageData);

  bufferStream.pipe(
    gridfsBucket.openUploadStream(name, {
      chunkSizeBytes: size,
      contentType: mimetype,
      metadata: {
        id,
        md5,
        info: req.body,
      },
    })
  );

  res.status(200).json({ status: "success" });
});

/**
 *  Get all files for the current user.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @author BloodyOrangeMan
 */
exports.getAll = catchAsync(async (req, res) => {
  const id = jwtDecoder(req.cookies.jwt).id;
  gridfsBucket.find({ "metadata.id": id }).toArray((err, files) => {
    // Check if files
    if (!files || files.length === 0) {
      res.status(404).json({
        status: "failed",
      });
    } else {
      res.status(200).json({
        status: "success",
        files: files,
      });
    }
  });
});

/**
 * Decrypt the file using the password entered by the user and open the download stream.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @author BloodyOrangeMan
 */
exports.download = catchAsync(async (req, res, next) => {
  const name = req.params.name;

  const id = jwtDecoder(req.cookies.jwt).id;

  await gridfsBucket.find({"metadata.id":id, filename: name }).toArray((err, files) => {
    if (!files || files.length === 0) {
      return next(new AppError("Not found!", 404));
    }
    if (files[0].metadata.id != id) {
      new next(new AppError("Permission denied!", 403));
    }
    const fileID = files[0]._id;
    const type = files[0].contentType;
    res.set({
      "Accept-Ranges": "bytes",
      "Content-Disposition": `attachment; filename=${name}`,
      "Content-Type": `${type}`,
    });

    downloadStream = gridfsBucket.openDownloadStream(fileID);

    let bufferArray = [];
    let decrypt;
    let resStream = new stream.PassThrough();

    downloadStream.on("data", function (chunk) {
      bufferArray.push(chunk);
    });

    downloadStream.on("end", async function () {
      let buffer = Buffer.concat(bufferArray);
      const decrypt = await decryptStream(buffer, '123456');
      resStream.end(decrypt);
      resStream.pipe(res);
    });
  });
});

/**
 * Delete user-specified file
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @author BloodyOrangeMan
 */
exports.delete = catchAsync(async (req, res, next) => {
  const name = req.params.name;

  const id = await jwtDecoder(req.cookies.jwt).id;

  await gridfsBucket
    .find({ "metadata.id":id, filename: name })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return next(new AppError("Not found!", 404));
      }
      if (files[0].metadata.id != id) {
        console.log(files[0].metadata.id);
        console.log(id);
        return new next(new AppError("Permission denied!", 403));
      }

      const fileID = files[0]._id;

      gridfsBucket.delete(fileID);

      res.status(200).json({ status: "success" });
    });
});
