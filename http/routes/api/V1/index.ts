module.exports = (path: string, app: any) => {
    const IndexRoutes = require('./IndexRoutes');
    const ProductRoutes = require('./ProductRoutes');

    app.use(`${path}/`, IndexRoutes);
    app.use(`${path}/product/`, ProductRoutes);
};