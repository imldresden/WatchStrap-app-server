// Imports
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const ip = require('ip');

// Configuration
const port = 31415;

app.use(express.static(path.join(__dirname, "frontend")));

// Objects
const connectionMap = new Map();

io.on('connection', client => {
    client.on('handshake', identifier => {
        connectionMap[identifier] = client;
        console.log("handshake:" + identifier);
    });

    client.on('msg', msg => {
        let target = connectionMap[msg.target];
        if (target)
            target.emit('msg', msg);
        else
            client.emit('err', {'error': 'TargetNotFound'});
    });
});

function getIdentifierByClientId(clientId) {
    return connectionMap.forEach((client, identifier) => {
        if (client.id === clientId) return identifier;
    });
}

http.listen(port, function () {
    console.log('Server listening at');
    console.log(ip.address() + ':' + port);
});