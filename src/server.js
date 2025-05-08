const app = require('./app');
const serverConfig = require('./config/serverConfig');
const logger = require('./utils/logger');

const PORT = process.env.PORT || serverConfig.port;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});