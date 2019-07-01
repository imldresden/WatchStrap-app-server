// Imports
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const ip = require('ip');

// Configuration
const port = 31415;
let remoteAddress;

process.argv.forEach(function (val, index, array) {
    if (val.startsWith("--remote=")) {
        remoteAddress = val.split('=')[1];
    }
});

app.use(express.static(path.join(__dirname, "frontend")));

// Objects
const connectionMap = new Map();

io.on('connection', client => {
    client.on('handshake', identifier => {
        connectionMap[identifier] = client;
        if (remoteAddress) {
            client.emit('redirect', remoteAddress);
        } else {
            client.emit('handshake');
        }
        if (identifier !== "main" && connectionMap['main'] !== undefined) {
            connectionMap['main'].emit('msg', {
                target: 'main',
                type: 'deviceConnected',
                payload: { identifier: identifier }
            });
        }
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