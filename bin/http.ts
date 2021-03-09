import express from 'express';
import { config } from 'dotenv';
import { createServer } from "http";
import bootstrap from "../config/bootstrap";

const app = express();
const http = createServer(app);
config();
bootstrap()
    .then(r => {
        http.listen(`${process.env.SERVER_PORT}`, () => {
            console.log(`listening on *:${process.env.SERVER_PORT}`);
            require('../app')(app, express, http);
        });
    })
    .catch(e => {
        throw new Error(e);
    })
