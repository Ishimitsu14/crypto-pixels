import express from 'express';
import { config } from 'dotenv';
import { createServer } from "http";
import bootstrap from "../config/bootstrap";

const app = express();
const http = createServer(app);
const ws = createServer();
config();
bootstrap()
    .then(r => {
        http.listen(`${process.env.SERVER_PORT}`, () => {
            console.log(`http listening on *:${process.env.SERVER_PORT}`);
            if (process.env.SERVER_TYPE === 'dev') {
                ws.listen(process.env.SOCKET_PORT, () => {
                    console.log(`sockets listening on *:${process.env.SOCKET_PORT}`);
                    require('../app')(app, express, http, ws);
                })
            }
            if (process.env.SERVER_TYPE === 'prod') {
                require('../app')(app, express, http);
            }
        });
    })
    .catch(e => {
        throw new Error(e);
    })
