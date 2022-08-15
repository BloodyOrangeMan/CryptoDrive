const mongoose = require('mongoose');
const dotenv = require('dotenv');
const https = require('https');
const fs = require('fs');

var key = fs.readFileSync(__dirname + '/cert.key');
var cert = fs.readFileSync(__dirname + '/cert.crt');

var options = {
  key: key,
  cert: cert
};

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3001;

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`App running on port ${port}...`);
});