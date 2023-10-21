// const client = new Client();
const qrcode = require('qrcode-terminal');
const fs = require("fs")
const database = require("./.database")

const db = database()
// // create a new collection in database 
// db.createCollection(".records");

// // add new field in collection
// let generatedId = db.addData(".records", {
//     name: 'John',
//     email: 'john.doe@example.com',
//     keywords: ["cycle", "duchaki"]
// });
// console.log(generatedId);

// // get the specific data by its id
let dataById = db.getDataById(".records", "cpu");
console.log(typeof (dataById));

const {
    Client,
    LocalAuth
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
        if (message.body.startsWith("!list")) {

            const msg = message.body
            const parsedResult = parseListMessage(msg);

            if (message.type === "image") {
                if (parsedResult) {
                    message.reply(`Your Item "${parsedResult.item}" has listed successfully`)
                } else {
                    message.reply(`*Invalid format - kindly list item with below format*\n\n!list\n\nitem: _<item_name>_\nname: _<your_name>_\ncontact: _<contact_no>_\nkeywords: _<keyword-1, keyword-2, keyword-n>_\n`)
                }
            } else {
                message.reply("Please attach the image of item!")
            }

        }
    }
});


client.initialize();
function parseListMessage(message) {
    const regex = /^!list\s+item:\s+(.+)\s+name:\s+(.+)\s+contact:\s*([6-9]\d{9})\s*keywords:\s+([^\n]+)\s*$/i;

    const match = message.match(regex);

    if (match) {
        const [, item, ownerName, contactNo, keywords] = match;

        // Check for unwanted symbols in item, ownerName, and keywords
        const hasUnwantedSymbols = /[$%^()_+={};:'"<>/\\[\]\-\|]/.test(item + ownerName + keywords);

        // Validate Indian contact number format
        const isValidIndianContact = /^[6-9]\d{9}$/.test(contactNo);

        if (!hasUnwantedSymbols && isValidIndianContact) {
            const keywordsArray = keywords.split(',').map(keyword => keyword.trim());

            const result = {
                item: item.trim(),
                name: ownerName.trim(),
                contact: contactNo.trim(),
                keywords: keywordsArray,
            };

            return result;
        } else {
            return null; // Names, keywords, or item names contain unwanted symbols, or invalid contact format
        }
    } else {
        return null; // Message doesn't match the expected format
    }
}
