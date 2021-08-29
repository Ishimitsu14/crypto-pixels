import { Application, Express } from 'express';
import { Server } from 'http';
// @ts-ignore
import expressIp from 'express-ip';
import cors from './middleware/cors'
import fileUpload from 'express-fileupload'

module.exports = (app: Application, express: Express, http: Server): void => {
    const init = () => {
        require('./sockets')(io);
        require('./http')(app, express, http)
    }
    const io = require('socket.io')(http);
    const path = require('path');
    const bodyParser = require('body-parser')
    const cookieParser = require('cookie-parser');
    app.use(fileUpload({
        useTempFiles: true,
        tempFileDir: '/tmp/'
    }))
    app.use(cors);
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(expressIp().getIpInfoMiddleware);

    init();
    // jobs();
}
