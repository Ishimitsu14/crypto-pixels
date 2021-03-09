import { createConnection, getConnection } from 'typeorm';
import { RedisClient } from "redis";
import sharp from 'sharp';
import { Image, loadImage } from "canvas";

export const timeoutPromise = (timeout: number) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
};

export const connect = async () => {
    try {
        return await getConnection();
    } catch (error) {
        return await createConnection();
    }
}

export const getAsyncRedis = (client: RedisClient, key: string): Promise<string | null> => {
    return new Promise<string | null>((resolve, reject) => {
        client.get(key, (err, reply) => {
            if (err) {
                reject(err);
            }
            resolve(reply);
        });
    })
}

export const asyncLoadCanvasImage = (src: string, width: number, height: number): Promise<Image | undefined> => {
    return new Promise((resolve, reject) => {
        sharp(src)
            .resize(width, height, { kernel: 'nearest' })
            .toBuffer()
            .then((buffer: string | Buffer) => {
                loadImage(buffer)
                    .then((image) => resolve(image))
                    .catch((err) => reject(err))
            })
            .catch((err: any) => reject(err))
    });
}

export const randomIntFromInterval = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
