const midi = require('midi');
const net = require('net');

const input = new midi.Input();

//for iRig keys
// 48~52, 53~59, 60~64, 65~71, 72~76, 77~84
var kidx = [ 48, 53, 60, 65, 72, 77, 85 ];
var kbkey = [ 's', 'd', 'f', 'j', 'k', 'l' ];

var keys = new Array(37).fill(0);
var key_before = new Array(6).fill(0);
var key_now = new Array(6).fill(0);
var key_xor = new Array(6).fill(0);
var tick = 0;

var targetSocket = null;

input.on('message', (deltaTime, message) => {
    // message: array
    //[ type, key, velocity ]

    // by msg type
    switch(message[0]) {
        case 144: // key press
            keys[message[1] - 48] = 1;
        break;

        case 128: // key release
            keys[message[1] - 48] = 0;
        break;

        case 176: // potentiometer controls
        break;
    }
    keyemulation();
});

var keyemulation = function() {
    // update key status
    for(var i = 0; i < 6; i++) {
        let counter = 0;
        for(var j = kidx[i]; j < kidx[i + 1]; j++) {
            if(keys[j - 48] == 1) counter++;
        }
        if(counter > 0) {
            key_now[i] = 1;
        }
        else key_now[i] = 0;
    }

    // XOR operation to find change(s)
    for(var i in key_xor) {
        key_xor[i] = key_before[i] ^ key_now[i];
    }
    
    key_before = key_now.slice();

    console.log(tick++);
    
    // map to key
    if(targetSocket != null) {
        for(var i in key_xor) {
            if(key_xor[i] == 1) { // if there any changes
                if(key_now[i] == 1) { // if pressed
                    targetSocket.write(`${i} 1`);
                }
                else { // if released
                    targetSocket.write(`${i} 0`);
                }
            }
        }
    }
}

input.openPort(0);

var server = net.createServer(socket => {
    targetSocket = socket;
    console.log("client connected.");

    socket.write('hello');
    socket.on('data', chunk => {
        console.log(chunk);
    })
    socket.on('end', () => {
        targetSocket = null;
        console.log('client disconnedted');
    })
})

server.listen(53123);