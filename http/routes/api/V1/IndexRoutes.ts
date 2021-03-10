import { Request, Response } from 'express';
import PunkGeneratorService from "../../../../services/PunkGeneratorService";
const express = require('express');
const router = express.Router();

router.get('/generate', async (req: Request, res: Response) => {
    const punkGeneratorService = new PunkGeneratorService(800, 800);
    await punkGeneratorService.generate();
    res.status(200).json({ gif: punkGeneratorService.link, uuid: punkGeneratorService.uuid, });
});

module.exports = router;
