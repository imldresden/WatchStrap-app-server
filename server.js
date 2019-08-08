// Imports
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const ip = require('ip');
const einkConverter = require('image_to_epaper_converter');
const imagejs = require('imagejs');
const { createCanvas, loadImage } = require('canvas')
const Dither = require('canvas-dither');

// Configuration
const idMain = "MAIN";
const idWatch = "WATCH";
const idStrap = "STRAP";
const idUpperStrap = "UPPER_STRAP";
const idLowerStrap = "LOWER_STRAP";

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
        connectionMap.set(identifier, client);
        if (remoteAddress) {
            client.emit('redirect', remoteAddress);
        } else {
            client.emit('handshake', 'ok');
        }
        if (identifier !== idMain && connectionMap.has(idMain)) {
            connectionMap.get(idMain).emit('info', {
                type: 'connect',
                identifier: identifier
            });
        }
    });

    client.on('msg', msg => {
        let target = connectionMap.get(msg.target);
        if (target)
            target.emit('msg', msg);
        /*else
            client.emit('err', {'error': 'TargetNotFound'});*/
    });

    client.on('convert', msg => {
        // Parse base64 string to a bitmap
        loadImage(msg.payload)
        .then((img) => {
            // img = Image object from the canvas library
            // Create canvas to generate a bitmap
            let canvas = createCanvas(msg.size.width, msg.size.height)
            let ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // Apply dithering if requested
            if (msg.dithering) {
                let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                imgData = Dither.atkinson(imgData);
                ctx.putImageData(imgData, 0, 0);
            }
            if (msg.invert) {
                let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let data = imgData.data;
                for (let i=0; i < data.length; i+=4) {
                    data[i] = 255 - data[i];
                    data[i+1] = 255 - data[i+1];
                    data[i+2] = 255 - data[i+2];
                }
                ctx.putImageData(imgData, 0, 0);
            }
            // Generate bitmap via JPEGStream
            stream = canvas.createJPEGStream({
                quality: 1,
                progressive: false,
                chromaSubsampling: true});
            let bitmap = new imagejs.Bitmap();
            bitmap.read(stream, { type: imagejs.ImageType.JPG })
                .then(function() { 
                    // bitmap.writeFile('image2.jpg', { quality:75 }).then(function() {
                    //     //console.log("2nd bitmap has been saved");
                    // });

                    // Convert bitmap to byteArray for eink display
                    einkConverter.convert({
                        source_file: '',
                        tasks: 'hexadecimal',
                        read_from_file: false,
                        bitmap: bitmap,
                        return_array: true,
                        display: {
                            width: 104,
                            height: 212,
                            fitmode: "none",
                            colormode: msg.invert ? 'invert' : 'normal',
                            fillmode: msg.invert ? 'invert' : 'normal'
                        }
                    }).then(byteArray => {
                        let dataAsInt = byteArray.map(byte => parseInt(byte, 16));
            
                        // Split array into three parts to avoid memory issues on micro controller
                        let msg1 = {
                            target: msg.target,
                            type: msg.type,
                            part: 0,
                            payload: dataAsInt.slice(0, Math.floor(byteArray.length / 3))
                        };
                        let msg2 = {
                            target: msg.target,
                            type: msg.type,
                            part: 1,
                            payload: dataAsInt.slice(Math.floor(byteArray.length / 3), Math.floor(byteArray.length * (2/3)))
                        };
                        let msg3 = {
                            target: msg.target,
                            type: msg.type,
                            part: 2,
                            payload: dataAsInt.slice(Math.floor(byteArray.length * (2/3)), dataAsInt.length)
                        };
                        try {            
                            connectionMap.get(msg.target).emit('msg', msg1);
                            connectionMap.get(msg.target).emit('msg', msg2);
                            connectionMap.get(msg.target).emit('msg', msg3);
                        }
                        catch(e) {
                            // Socket for loStrap not available
                        }
                    })
                    .catch(error => console.log(error));
                });
        }).catch(err => {
            // Error converting image
          });        
    })

    client.on('disconnect', (reason) => {
        let identifier = getIdentifierByClientId(client.id);
        connectionMap.delete(identifier);


        if (connectionMap.has(idMain))
            connectionMap.get(idMain).emit('info', {
                type: 'disconnect',
                identifier: identifier
            });
    })
});

function getIdentifierByClientId(clientId) {
    let elem;
    connectionMap.forEach((client, identifier) => {
        if (client.id === clientId) elem = identifier;
    });
    return elem;
}

http.listen(port, function () {
    console.log('Server listening at');
    console.log(ip.address() + ':' + port);
});