/**
 * @file Controller for handling user requests for file operations
 */
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const jwtDecoder = require("jwt-decode");
const stream = require("stream");
const { fromBuffer } = require("file-type");
const { promisify } = require("util");
const sodium = require("libsodium-wrappers");
const Key = require("../models/keyModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("../models/userModel");
const Share = require("../models/shareModel");
const crypto = require("crypto");
const {
  shareEncrptStream,
  decryptStream,
  signStream,
  openSignStream,
  genSignKeyPair,
} = require("./../utils/cryptoFeatures");

const whiteList = process.env.WHITELIST_TYPE.split(", ");
const DB = process.env.DATABASE_LOCAL;
const conn = mongoose.createConnection(DB);

let gfs1, gfs2;

conn.once("open", () => {
  gfs1 = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  gfs2 = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "share",
  });
});

exports.getShareFileInfo = catchAsync(async (req, res, next) => {
  const { key: token } = req.params;
  const shareInfo = await Share.findOne({ token })
  if (!shareInfo) return next(new AppError("Not found!", 404));

  const { jwtid, ddl, count,filename } = shareInfo
  try {
    await gfs1
      .find({ "metadata.id": jwtid,filename })
      .toArray((err, files) => {
        if (!files || files.length === 0) {
          return next(new AppError("Not found!", 404));
        }
        return res.status(200).json({ status: "success", info: { ...files[0].metadata.info, token, ddl, count } })
      })
  } catch (err) {
    return next(new AppError("Not found!", 404))
  }


})


/**
* Share files.
* @param {*} req
* @param {*} res
* @param {*} next
* @author BloodyOrangeMan,cais-ou
*/
exports.share = catchAsync(async (req, res, next) => {
  let { password, passphrase, count, ddl} = req.body;
  let endDay =  new Date(ddl)
  let nowDay = new Date()
  nowDay.setHours(0,0,0,0)
  endDay.setHours(23,59,59,59)
  let endTime = endDay.getTime() / 1000 - parseInt(nowDay.getTime() / 1000);
  ddl = (parseInt(endTime / 60 / 60 / 24) + 1)+"d"

  console.log({password, passphrase, count, ddl})
  if (!password) {
    return next(new AppError("No password!", 404));
  }
  const name = req.params.name;
  const id = jwtDecoder(req.cookies.jwt).id;
  await gfs1
    .find({ "metadata.id": id, "metadata.info.fileName": name })
    .toArray(async (err, files) => {
      if (!files || files.length === 0) {
        return next(new AppError("Not found!", 404));
      }
      const fileID = files[0]._id;
      const type = files[0].contentType;
      const userID = files[0].metadata.id;
      const key = crypto.randomBytes(8).toString("base64");
      if (userID != id) {
        new next(new AppError("Permission denied!", 403));
      }
      downloadStream = gfs1.openDownloadStream(fileID);
      let bufferArray = [];

      downloadStream.on("data", function (chunk) {
        bufferArray.push(chunk);
      });

      downloadStream.on("end", async function () {
        let buffer = Buffer.concat(bufferArray);
        const decrypt = await decryptStream(buffer, passphrase);
        const encryptedData = await shareEncrptStream(
          decrypt,
          key,
          files[0].metadata.sha,
        );
        const user = await User.findOne({ userID });
        const signData = await signStream(encryptedData, user.saltForKeyPair
          , password);
        //  console.log(user.saltForKeyPair);
        const bufferStream = new stream.PassThrough();
        bufferStream.end(signData);
        bufferStream.pipe(
          gfs2.openUploadStream(files[0].filename, {
            chunkSizeBytes: files[0].chunkSize,
            contentType: files[0].contentType,
            metadata: {
              id: files[0].metadata.id,
              fileID: files[0]._id,
              md5: files[0].metadata.md5,
              sha: files[0].metadata.sha,
              info: {
                fileName: files[0].metadata.info.fileName,
                createDate: new Date().toDateString(),
                lastModified: new Date().toDateString(),
                fileSize: files[0].metadata.info.fileSize,
                type: files[0].metadata.info.type,
                count: parseInt(count),
              },
            },
          })
        );
      });
      const token = signToken(files[0]._id, count, ddl);
      //    const shareURL = `${req.protocol}://${req.get(
      //    'host'
      //  )}/api/share/download/${token}`;
      const shareURL = `share/${token}`
      await Share.create({
        token,
        key,
        ddl,
        count,
        jwtid: id,
        filename:name
      })
      res.status(200).json({ status: "success", shareURL, key });
    });
});

const signToken = (id, count, time) => {
  return jwt.sign({ id, count }, process.env.JWT_SECRET, {
    expiresIn: time,
  })
};

/**
* Download share files.
* @param {*} req
* @param {*} res
* @param {*} next
* @author BloodyOrangeMan,cais-ou
*/
exports.shareDownload = catchAsync(async (req, res, next) => {
  if (req.params.token) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.params.token,
        process.env.JWT_SECRET
      );
      const id = mongoose.Types.ObjectId(decoded.id);
      let count;
      let fileID;
      await gfs2
        .find({ "metadata.fileID": id })
        .toArray((err, files) => {
          if (!files) {
            return next(new AppError("Not Found!", 404));
          }
          const type = files[0].contentType;
          const name = files[0].filename;
          const userID = files[0].metadata.id;
          count = files[0].metadata.info.count;
          fileID = files[0]._id;
          res.set({
            "Accept-Ranges": "bytes",
            "Content-Disposition": `attachment; filename=${name + '.cuc'}`,
            "Content-Type": "application/octet-stream",
          });

          downloadStream = gfs2.openDownloadStream(fileID);

          let bufferArray = [];
          let resStream = new stream.PassThrough();

          downloadStream.on("data", function (chunk) {
            bufferArray.push(chunk);
          });

          downloadStream.on("end", async function () {
            let buffer = Buffer.concat(bufferArray);
            const user = await User.findOne({ userID });
            console.log(user.publicKey);
            const decrypt = await openSignStream(buffer, user.publicKey);
            resStream.end(decrypt);
            resStream.pipe(res);
          });
          gfs2.s._filesCollection.findOneAndUpdate(
            { "metadata.fileID": id },
            { $inc: { "metadata.info.count": -1 } },
            { upsert: true },
            () => {
              if (count === 1) {
                gfs2.delete(fileID);
              }
            });
        });
    } catch (err) {
      if (err.message == 'jwt expired') {
        return next(new AppError("jwt expired", 410))
      };
    }
  }
});
