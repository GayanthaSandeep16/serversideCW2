const app = require('./app');
const serverConfig = require('./config/serverConfig');

const PORT = serverConfig.port ;

//server startup
app.listen(PORT, () => {    
    console.log(`Server is running on port ${PORT}`);
});