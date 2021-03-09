module.exports = (app: any, express: any, http: any) => {
    require('./routes')(app);
}