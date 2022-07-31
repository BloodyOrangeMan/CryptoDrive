const mongoose = require('mongoose');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const DB = process.env.DATABASE_LOCAL;

const conn = mongoose.createConnection(DB);

// Init gfs
let gfs;

conn.once('open', () => {
  // Init stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});

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
          metadata: req.body
        };
        resolve(fileInfo);
      });
    });
  }
});


exports.upload = multer({ storage });