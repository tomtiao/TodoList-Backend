import express from 'express';
import path from 'path';
import compression from 'compression';
import todoController from './controllers/todoController';
import { todo_path } from './todo/Todo';
import createPool from './util/createPool';

const app = express()
const PORT = 2333;

const pool = createPool();

console.log(`Current working directory is ${__dirname}.`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/static', express.static(path.join(__dirname, '..', '..', 'public')));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
});

app.use(compression());

app.use(todo_path,
    function passPool(_req, res, next) {
        res.locals.pool = pool;
        next();
    }, todoController);

const server = app.listen(PORT, () => {
    console.log(`Listening port ${PORT}.`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing server...');
    server.close(() => {
        console.log('server closed.')
    });
});

export default app;