import { AppConfig } from '../models/AppConfig';
import { createConnection, getRepository } from "typeorm";
import constantsConfig from './constantsConfig';

export = async () => {
    try {
        // const config = Object.keys(constantsConfig) as Array<keyof typeof constantsConfig>;
        // await createConnection();
        // const appConfigRepository = getRepository(AppConfig);
        // for (const key of config) {
        //     const entity = await appConfigRepository.findOne({ key: constantsConfig[key] });
        //     if (!entity) {
        //         await appConfigRepository.insert({
        //             key: constantsConfig[key],
        //             data: { value: '', additional: {} },
        //         })
        //     }
        // }
        return true;
    } catch (e) {
        throw Error(e);
    }
}
