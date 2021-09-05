import {Server as SocketServer} from "socket.io";
import {Server} from "http";
import path from "path";
import fs from "fs";
const cors = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}

const getRoute = (http: Server, path: string): SocketServer => {
    return require('socket.io')(http, {
        cors,
        path: `/socket.io${path}`
    })
}

const toKebabCase = (str: string) => {
    return str.split('').map((letter, idx) => {
        return letter.toUpperCase() === letter
            ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
            : letter;
    }).join('');
}

const getRouteNameByFile = (fileName: string) => {
    const fileNameArr = fileName.split('.')
    fileNameArr.pop()
    return toKebabCase(fileNameArr.join(''))
}

const itemsLoop = (route: { route: string; path: string }, http: Server) => {

    // Reads all the files in a directory
    const items = fs.readdirSync(route.path)
    const listeners: any[] = []
    const io = getRoute(http, route.route ? route.route : '/')
    items.map((item: string) => {
        const fullPath = `${route.path}/${item}`
        const routeName = route.route ? `${route.route}/${getRouteNameByFile(item)}` : `/`
        if (fs.lstatSync(fullPath).isFile()) {
            // Requires all the files in the directory that is not a index.js.
            listeners.push(require(fullPath))
        }
        if (fs.lstatSync(fullPath).isDirectory()) {
            itemsLoop({ route: `${route.route}/${item}`, path: fullPath }, http)
        }
    })
    listeners.map((fn) => fn(io))
}

module.exports = (http: Server) => {
    const indexRoute = {
        route: '',
        path: `${path.resolve(__dirname)}/routes`
    }
    itemsLoop(indexRoute, http)
}
