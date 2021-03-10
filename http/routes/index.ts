module.exports = (app: any) => {
    require('./api/V1')('/api/v1', app);

    const IndexRoutes = require('./IndexRoutes');
    app.use('/', IndexRoutes);
};
