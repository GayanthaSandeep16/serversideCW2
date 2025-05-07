const express = require('express');
const routes = require('./routes');
const erroMiddleware = require('./middleware/errorMiddleware');
const serverConfig = require('./config/serverConfig');


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', routes);
app.use(erroMiddleware);


module.exports = app;