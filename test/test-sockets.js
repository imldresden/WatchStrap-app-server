const identifiers = [
    "main",
    "lo-display",
    "mi-display",
    "hi-display"
];
const port = 31415;

const io = require('socket.io-client');
const sockets = {};

const assert = require('assert');

describe('Sockets', () => {
    describe('connect', () => {
        it('should connect without error or timeout', (done) => {
            for (let identifier of identifiers) {
                let socket = io('http://localhost:' + port);

                socket.on('connect', () => {
                    socket.emit('handshake', identifier);
                    sockets[identifier] = socket;
                    if (Object.keys(sockets).length === identifiers.length)
                        done();
                });

                socket.on('connect_error', e => {
                    done(e);
                });

                socket.on('connect_timeout', e => {
                    done(e);
                });

                socket.on('error', e => {
                    done(e);
                });
            }
        });
    });
    describe('communication', () => {
        it('should return message to correct target', (done) => {
            let testMsg = {
                'target': identifiers[1],
                'type': 'test-sockets.js',
                'payload':  {
                    'test': 'data'
                }
            };
            sockets[identifiers[1]].on('msg', msg => {
               assert.deepStrictEqual(msg, testMsg);
               done();
            });
            sockets[identifiers[0]].emit('msg', testMsg);
        });

        /*
        it('should return an error to sender for wrong targets', (done) => {
            let testMsg = {
                'target': 'wrong-target',
                'type': 'test-sockets.js',
                'payload':  {
                    'test': 'data'
                }
            };
            sockets[identifiers[2]].on('err', msg => {
                assert.strictEqual(msg['error'], 'TargetNotFound');
                done();
            });
            sockets[identifiers[2]].emit('msg', testMsg);
        });*/
    });

    after(() => {
        for (let socketId in sockets) {
            sockets[socketId].close();
        }
    })
});
