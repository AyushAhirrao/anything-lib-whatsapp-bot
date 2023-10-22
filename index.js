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


const {
    Client,
    LocalAuth,
    MessageMedia
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

client.on('message', async message => {

    const inventory = "120363174223172858@g.us"
    const transactions = "120363174977415228@g.us"

    // console.log("message obj - ", message)
    if (message.from == inventory) {
        if (message.body.startsWith("!list")) {
            const msg = message.body
            const parsedResult = parseListMessage(msg);

            if (message.type === "image") {
                if (parsedResult) {
                    console.log("entered")
                    const media = await message.downloadMedia()
                    const img_path = `.database/.data/.images/${Date.now()}${parsedResult.item}.${getFileExtensionFromMimeType(media.mimetype)}`;
                    fs.writeFileSync(img_path, media.data, 'base64');
                    const item_id = db.addData(".records", {
                        "item": parsedResult.item,
                        "available": true,
                        "owner": parsedResult.owner,
                        "contact": parsedResult.contact,
                        "keywords": parsedResult.keywords,
                        "image_path": img_path
                    })
                    message.reply(`Your Item "${parsedResult.item}" with item id "${item_id}" has listed successfully`)
                } else {
                    message.reply(`*Invalid format - kindly list item with below format*\n\n!list\n\nitem: _<item_name>_\nowner: _<your_name>_\ncontact: _<contact_no>_\nkeywords: _<keyword-1, keyword-2, keyword-n>_\n`)
                }
            } else {
                message.reply("Please attach the image of item!")
            }
        }

        // Retrieving data (!find items)
        if (message.body === "!find") {
            stat = db.getAllDataAndStatus(".records");
            message.reply(stat)
        }

        // !find args
        const words = message.body.trim().toLocaleLowerCase().split(/\s+/);
        const keyword = words[1];
        const available = words[2];

        if (message.body.trim().toLocaleLowerCase().startsWith("!find ") && available === "available") {
            const stat = db.getDataByKeywords(".records", keyword)
            let available_flag = false
            if (!stat) {
                message.reply("Item not found")

            } else {
                stat.forEach(e => {
                    if (e.available) {
                        // Assuming you have the image data in e.image_path, adjust accordingly
                        const imageBuffer = fs.readFileSync(e.image_path); // Read the image file

                        const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));
                        const caption = `Item ID: ${e.id}\n\nItem: ${e.item}\nOwner: ${e.owner}\nContact: ${e.contact}\nStatus: ${e.available ? "available" : "not available"}`;

                        client.sendMessage(message.from, media, {
                            caption: caption
                        });

                        available_flag = true
                    } else {
                        available_flag = false
                    }
                });

                if (!available_flag) {
                    message.reply("Item not available")
                }
            }
        } else if (message.body.trim().toLocaleLowerCase().startsWith("!find ") && available === undefined) {
            const stat = db.getDataByKeywords(".records", keyword)

            if (!stat) {
                message.reply("Item not found")

            } else {
                stat.forEach(e => {
                    // Assuming you have the image data in e.image_path, adjust accordingly
                    const imageBuffer = fs.readFileSync(e.image_path); // Read the image file

                    const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));
                    const caption = `Item ID: ${e.id}\n\nItem: ${e.item}\nOwner: ${e.owner}\nContact: ${e.contact}\nStatus: ${e.available ? "available" : "not available"}`;

                    client.sendMessage(message.from, media, {
                        caption: caption
                    });
                });
            }

        } else if (message.body.trim().toLocaleLowerCase().startsWith("!find ")) {
            message.reply("*Invalid format* - !find <keyword> available")
        }

        if (message.body.trim().toLocaleLowerCase().startsWith("!confirm")) {
            message.reply("please confirm the transactions in the transactions channel ")
        }

    }

    if (message.from == transactions) {
        if (message.body.trim().toLocaleLowerCase().startsWith("!confirm")) {
            const words = message.body.trim().toLocaleLowerCase().split(/\s+/);

            if (words.length != 2) {
                message.reply("*Invalid Format* - !confirm <Item ID>")
            } else {
                const id = words[1];
                const item = db.getDataById(".records", id)

                if (item) {
                    if (item.available) {
                        const stat = db.updateData(".records", id, {
                            "available": false
                        })
                        if (stat) {
                            message.reply("Your transaction has been recorded")
                        }
                    } else {
                        message.reply("Currently, the item is not available")
                    }
                } else {
                    message.reply("No such item is listed")
                }
            }

        }
    }

});

client.initialize();

function parseListMessage(message) {
    const regex = /^!list\s+item:\s+(.+)\s+owner:\s+(.+)\s+contact:\s*([6-9]\d{9})\s*keywords:\s+([^\n]+)\s*$/i;

    const match = message.match(regex);

    if (match) {
        const [, item, ownerName, contactNo, keywords] = match;

        // Check for unwanted symbols in item, ownerName, and keywords
        const hasUnwantedSymbols = /[$%^()_+={};:'"<>/\\[\]\-\|]/.test(item + ownerName + keywords);

        // Validate Indian contact number format
        const isValidIndianContact = /^[6-9]\d{9}$/.test(contactNo);

        if (!hasUnwantedSymbols && isValidIndianContact) {
            const keywordsArray = keywords.split(',').map(keyword => keyword.trim().toLocaleLowerCase());

            const result = {
                item: item.trim().toLocaleLowerCase(),
                owner: ownerName.trim().toLocaleLowerCase(),
                contact: contactNo.trim().toLocaleLowerCase(),
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

function getFileExtensionFromMimeType(mimeType) {
    const mimeToExtension = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
    };

    // Convert MIME type to lowercase for case-insensitive comparison
    const lowerCaseMimeType = mimeType.toLowerCase();

    // Check if the mapping contains the provided MIME type
    if (mimeToExtension.hasOwnProperty(lowerCaseMimeType)) {
        return mimeToExtension[lowerCaseMimeType];
    } else {
        // If the MIME type is not in the mapping, return null or handle accordingly
        return null;
    }
}