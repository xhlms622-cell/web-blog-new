const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/index');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { code: 429, message: '请求过于频繁，请稍后再试' }
});
app.use('/api/', limiter);

app.use('/api', require('./routes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
