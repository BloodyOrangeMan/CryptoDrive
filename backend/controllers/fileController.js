/**
 * @file Controller for handling user requests for file operations
 */
const mongoose = require("mongoose");
const jwtDecoder = require("jwt-decode");
const stream = require("stream");
const { fromBuffer } = require("file-type");

const sodium = require("libsodium-wrappers");
const User = require("../models/userModel");
const Key = require("../models/keyModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const {
  shareEncrptStream,
  encryptStream,
  sha256,
  decryptStream,
  signStream,
  openSignStream,
} = require("./../utils/cryptoFeatures");

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
  let fileList = req.files.file;
  if (!Array.isArray(req.files.file)) {
    fileList = [];
    fileList.push(req.files.file);
  }

  for (const file of fileList) {
    const fileTypeFromBuffer = await fromBuffer(file.data);
    if (req.files == null) {
      return next(new AppError("Please provide a file!", 400));
    }
    if (!whiteList.includes(fileTypeFromBuffer.mime)) {
      return next(new AppError("File type not allowed", 415));
    }
  }

  next();
});

exports.checkPassphrase = catchAsync(async (req, res, next) => {
  let keyID, passphrase;
  if (req.method == "POST") {
    keyID = req.body.key;
    passphrase = req.body.passphrase;
  } else if (req.method == "GET") {
    keyID = req.headers.key;
    passphrase = req.headers.passphrase;
  }

  if (!keyID || !passphrase) {
    return next(new AppError("Please provide a key and passphrase"), 400);
  }

  const key = await Key.findOne({ _id: keyID }).select("+passphrase");

  if (!(await key.correctPassphrase(passphrase, key.passphrase))) {
    return next(new AppError("Incorrect key passphrase"), 401);
  }

  await Key.findOneAndUpdate(
    { _id: keyID },
    { $inc: { times: 1 } },
    { upsert: true }
  );

  next();
});

/**
 * Encrypt user uploaded files using Xchacha20Poly1305 algorithm,
 * generate encryption key using passphrase entered by user,
 * store buffer to MongoDB using GridFS.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @author cais-ou
 */
exports.findSha = catchAsync(async (req, res, next) => {
  const id = jwtDecoder(req.cookies.jwt).id;
  const sha = await sha256(req.files.file.data);
  await gridfsBucket.find({ "metadata.id": id }).toArray((err, files) => {
    if (files.map(shaarray => shaarray.metadata.sha).indexOf(sha) != -1 ){
       return next(new AppError("Permission denied!", 403));
    }
    next();
  })
})

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
  const id = jwtDecoder(req.cookies.jwt).id;
  const sha = await sha256(req.files.file.data);
  console.log(sha)
  let fileList = req.files.file;
  if (!Array.isArray(req.files.file)) {
    fileList = [];
    fileList.push(req.files.file);
  }
  for (const file of fileList) {
    const { name, data, size, mimetype, md5 } = file;
    const storageData = await encryptStream(data, req.body.passphrase);
    const bufferStream = new stream.PassThrough();
    bufferStream.end(storageData);
    bufferStream.pipe(
    gridfsBucket.openUploadStream(name, {
        chunkSizeBytes: size,
        contentType: mimetype,
        metadata: {
          id,
          md5,
          sha,
              info: {
                fileName: name,
                createDate: new Date().toDateString(),
                lastModified: new Date().toDateString(),
                fileSize: (Math.round(size * Math.pow(10, -6) * 100) / 100).toFixed(
                  3
                ),
                type: mimetype,
              },
            },
          })
        );
      } 
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
 * File hash value display.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @author cais-ou
 */
exports.hashvalue = catchAsync(async (req, res, next) => {
      const name = req.params.name;
      const id = await jwtDecoder(req.cookies.jwt).id;
      gridfsBucket.find({ "metadata.id": id }).toArray((err, files) => {
      const sha256=files[0].metadata.sha;
      if (!sha256 || sha256.length == 0) {
        return next(new AppError('Hash value err!'), 404);
      }
      res.status(200).json({
         sha256
      })
  });
})

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
  console.log(name);

  await gridfsBucket
    .find({ "metadata.id": id, "metadata.info.fileName": name })
    .toArray((err, files) => {
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
      let resStream = new stream.PassThrough();

      downloadStream.on("data", function (chunk) {
        bufferArray.push(chunk);
      });
      
      downloadStream.on("end", async function () {
      let buffer = Buffer.concat(bufferArray);
      const decrypt = await decryptStream(buffer, req.headers.passphrase);
      
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
    .find({ "metadata.id": id, filename: name })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return next(new AppError("Not found!", 404));
      }
      if (files[0].metadata.id != id) {
        console.log(files[0].metadata.id);
        console.log(id);
        return next(new AppError("Permission denied!", 403));
      }

      const fileID = files[0]._id;

      gridfsBucket.delete(fileID);

      res.status(200).json({ status: "success" });
    });
});

exports.update = catchAsync(async (req, res, next) => {
  const fileID = req.body.data.fileID;
  const filename = req.body.data.metadata.filename;

  const filter = {_id:mongoose.Types.ObjectId(fileID)};
  const update = {'$set':{'metadata.info.fileName':filename}};

  await gridfsBucket.s._filesCollection.updateOne(filter,update);

  res.status(200).json({status:"success"});
})

