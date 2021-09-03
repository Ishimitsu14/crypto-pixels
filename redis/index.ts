import redis from "redis";
import ProductChannel from "./ProductChannel";

module.exports = () => {
    const client = redis.createClient()
    client.on('message', ProductChannel)
    client.subscribe('products')
}