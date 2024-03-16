
const path = require("path");
const http = require('http');
const express = require('express');
const cors = require('cors');
const wp_connection  = require('./wpConnection');
const router  = require('./router/index');

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);
app.use(cors());

// Importar Socket.IO
const io = require('socket.io')(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(__dirname + "/"));

server.listen(3000, () => {
    console.log("Servidor WebSocket ouvindo na porta" + port);
});

let Mai; // Mantenha Mai definido no escopo mais alto possível

async function init() {
    Mai = await wp_connection.startMai(io);  
    router.init(io,app,Mai,wp_connection);
}


init();
