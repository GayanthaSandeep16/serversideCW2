const app = require('./App');
const serverConfig = require('./config/serverConfig');

const PORT = serverConfig.port ;

app.listen(PORT, () => {    
    console.log(`Server is running on port ${PORT}`);
});