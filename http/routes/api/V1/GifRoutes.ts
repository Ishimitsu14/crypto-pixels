import { Request, Response } from 'express';
import PunkGeneratorService from "../../../../services/PunkGeneratorService";
import fs from "fs";
import appRoot from "app-root-path";
const express = require('express');
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    let gifs = [];
    const uuidArray = fs.readdirSync(`${appRoot}/punks/`);
    for (const uuid of uuidArray) {
        if (uuid !== '.gitignore') {
            gifs.push({
                uuid,
                src: `${process.env.BASE_URL}/api/v1/gif/${uuid}`
            })
        }
    }
    res.status(200).json(gifs);
});

router.get('/generate', async (req: Request, res: Response) => {
    const punkGeneratorService = new PunkGeneratorService(400, 400);
    await punkGeneratorService.generate();
    res.status(200).json({ gif: punkGeneratorService.src, uuid: punkGeneratorService.uuid, });
});

router.get('/:uuid', async (req: Request, res: Response) => {
    res.status(200).sendFile(`${appRoot}/punks/${req.params.uuid}/punk.gif`);
});


module.exports = router;
