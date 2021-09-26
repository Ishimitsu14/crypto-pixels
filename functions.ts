import { createConnection, getConnection } from 'typeorm';
import { RedisClient } from "redis";
import { Image, loadImage } from "canvas";

export const timeoutPromise = (timeout: number) => {
    return new Promise((resolve) => setTimeout(resolve, timeout));
};

export const connect = async () => {
    try {
        return await createConnection();
    } catch (error) {
        return getConnection('default');
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

export const asyncLoadCanvasImage = (src: string): Promise<Image | undefined> => {
    return new Promise((resolve, reject) => {
        loadImage(src)
            .then((image) => resolve(image))
            .catch((err) => reject(err))
    });
}

export const randomIntFromInterval = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
