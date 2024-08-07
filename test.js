const net = require('net');
const startTime = Date.now();

const host = 'google.com';
const port = 80;  // Commonly 80 for HTTP or 443 for HTTPS

const socket = new net.Socket();

socket.on('connect', function() {
    socket.end();
    console.log(`Ping time to ${host}: ${Date.now() - startTime} ms`);
});

socket.on('error', function(err) {
    console.error(`Error connecting to ${host}: ${err.message}`);
});

socket.connect(port, host);
