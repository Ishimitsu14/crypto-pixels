module.exports = (path: string, app: any) => {
    const IndexRoutes = require('./IndexRoutes');
    const GifRoutes = require('./GifRoutes');

    app.use(`${path}/`, IndexRoutes);
    app.use(`${path}/gif/`, GifRoutes);
};