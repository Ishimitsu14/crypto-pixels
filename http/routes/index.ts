module.exports = (app: any) => {
    require('./api/V1')('/api/v1', app);
};