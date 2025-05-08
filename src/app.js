const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const erroMiddleware = require('./middleware/errorMiddleware');
const serverConfig = require('./config/serverConfig');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);
app.use(erroMiddleware);

module.exports = app;