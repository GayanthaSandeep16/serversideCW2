const app = require('./app');
const serverConfig = require('./config/serverConfig');

const PORT = process.env.PORT || serverConfig.port;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});