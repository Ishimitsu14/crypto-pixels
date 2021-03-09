import { Application, Express } from 'express';
import { Server } from 'http';
const expressip = require('express-ip');

module.exports = (app: Application, express: Express, http: Server): void => {
    const init = () => {
        require('./sockets')(io);
        require('./http')(app, express, http)
    }
    const io = require('socket.io')(http);
    const path = require('path');
    const bodyParser = require('body-parser')
    const cookieParser = require('cookie-parser');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(expressip().getIpInfoMiddleware);

    init();
    // jobs();
}
