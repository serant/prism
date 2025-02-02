const http = require('http');
const app = require('./app');

const port = process.env.API_PORT || 3000;

const server = http.createServer(app);
app.listen(port, () => {
    console.info(`Listening on port ${port}...`);
});