import {Server} from "http";

type ISocketMethods = {
    createSockets(http: Server): void
}