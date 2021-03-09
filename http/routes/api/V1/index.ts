module.exports = (path: string, app: any) => {
    const IndexRoutes = require('./IndexRoutes');

    app.use(`${path}/`, IndexRoutes);
};