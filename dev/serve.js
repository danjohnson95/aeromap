const Express = require('express')
const port = "8080"
const server = Express()

server.use(Express.static('dist'))
server.listen(port)

console.log('Server is running at http://localhost:' + port)