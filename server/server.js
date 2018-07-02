const path = require('path')
const DB = require('./db')
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router(DB)
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
})
server.use("/api", router);
server.use(router)
server.listen(3000, () => {
    console.log('JSON Server is running')
})