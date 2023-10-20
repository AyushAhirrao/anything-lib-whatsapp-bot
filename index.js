// const client = new Client();
const qrcode = require('qrcode-terminal');
const fs = require("fs")
const {
    Client,
    LocalAuth,
    ChatTypes
} = require('whatsapp-web.js');

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "client-one"
    })
})

// Save session values to the file upon successful auth
client.on('authenticated', (session) => {});

client.on('qr', qr => {
    qrcode.generate(qr, {
        small: true
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', message => {
    console.log("message obj - ", message)
    if (message.from === "120363174223172858@g.us") {
        if (message.body === '!list') {
            message.reply('list..........');
        }
    }
});


client.initialize();