export = async () => {
    try {
        return true;
    } catch (e) {
        throw Error('Error after bootstrap');
    }
}