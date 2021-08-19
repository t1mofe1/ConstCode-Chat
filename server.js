import express from 'express';
import http from 'http';
import path from 'path';

const __dirname = path.resolve();

const app = express();
const server = http.createServer(app);

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => res.sendFile(__dirname + '/views/index.html'));
app.get('*', (req, res) => res.redirect('/'));

export default server;
export { app, server };
