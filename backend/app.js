const express = require('express');
const morgan = require('morgan');

const authRouter = require('./routes/authRoutes')
const AppError = require('./utils/appError');

const app = express();

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

app.use(express.json());
 // app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
  });

app.use('/api', authRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

module.exports = app;