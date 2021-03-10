import { Request, Response } from 'express';
import appRoot from 'app-root-path';
import fs from 'fs';
import PunkGeneratorService from "../../services/PunkGeneratorService";


const express = require('express');
const router = express.Router();

router.get('/generate', async (req: Request, res: Response) => {
    const punkGeneratorService = new PunkGeneratorService(800, 800);
    await punkGeneratorService.generate();
    res.status(200).sendFile(punkGeneratorService.link);
});

router.get('/gif/:uuid', async (req: Request, res: Response) => {
    res.status(200).sendFile(`${appRoot}/punks/${req.params.uuid}/punk.gif`);
});

router.get('/gif/', async (req: Request, res: Response) => {
    let gifs = [];
    const uuidArray = fs.readdirSync(`${appRoot}/punks/`);
    for (const uuid of uuidArray) {
        if (uuid !== '.gitignore') {
            gifs.push(`/gif/${uuid}`)
        }
    }
    res.status(200).json({ gifs });
});

module.exports = router;
