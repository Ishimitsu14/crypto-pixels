import { Request, Response } from 'express';
import appRoot from "app-root-path";
import { UploadedFile } from "express-fileupload";
import redis from 'redis'
import AdmZip from 'adm-zip'
const express = require('express');
const router = express.Router();

router.get('/', async (req: Request, res: Response) => {
    res.status(200).json({});
});

router.post('/upload-titles', (req: Request, res: Response) => {
    const redisClient = redis.createClient()
    let file: UploadedFile;
    let uploadPath: string | Buffer | undefined;

    if (!req.files) {
        return res.status(400).json({ error: { message: 'No files were uploaded.' } })
    }

    // @ts-ignore
    file = req.files.source_titles
    uploadPath = `${appRoot.path}/source_titles_archives/${file.name}`
    file.mv(uploadPath, function (err) {
        if (err) {
            return res.status(500).json({ error: { message: err.message } })
        }

        const zip = new AdmZip(uploadPath)
        zip.extractAllTo(`${appRoot}/source_titles/`, true)
        redisClient.publish('resize', 'true')
        res.status(200).json({ success: { message: 'File is uploaded and resized' } })
    })
})

module.exports = router;
