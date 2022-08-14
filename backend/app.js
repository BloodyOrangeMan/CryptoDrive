const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');

const authRouter = require('./routes/authRoutes');
const fileRouter = require('./routes/fileRoutes');
const keyRouter = require('./routes/keyRoutes');
const shareRouter = require('./routes/shareRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cookieParser());

// Set security HTTP headers
app.use(helmet());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(fileUpload({
  limits: {
    fileSize: 10000000 //10MB
  },
  abortOnLimit: true
}));
// app.use(express.static(`${__dirname}/public`));

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in five minutes!'
});
app.use('/api', limiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());



app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/', authRouter);
app.use('/api/file', fileRouter);
app.use('/api/key', keyRouter);
app.use('/api/share',shareRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;