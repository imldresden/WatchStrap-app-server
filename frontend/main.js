const socket = io();
const identifier = "main";

socket.on('connect', () => {
   console.log('connected to server');
   socket.emit('handshake', identifier);
});

socket.on('err', data => {
    console.log("error", data);
});

socket.on('msg', msg => {
    console.log("msg", msg);
});
