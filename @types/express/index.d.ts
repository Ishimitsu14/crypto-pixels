export {};

declare global{
    namespace Express {
        interface Request {
            country: string;
            ipInfo: any;
        }
    }
}