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
    const args = message.body.trim().toLocaleLowerCase().split(/\s+/);

    // inventory group
    if (message.from == inventory) {
        if (message.body.startsWith("!list")) {
            const msg = message.body
            const parsedResult = parseListMessage(msg);

            if (message.type === "image") {
                if (parsedResult) {
                    const media = await message.downloadMedia()
                    const img_path = `.database/.data/.images/${Date.now()}${parsedResult.item}.${getFileExtensionFromMimeType(media.mimetype)}`;
                    fs.writeFileSync(img_path, media.data, 'base64');
                    const item_id = db.addData(".records", {
                        "item": parsedResult.item,
                        "available": true,
                        "owner": parsedResult.owner,
                        "contact": parsedResult.contact,
                        "keywords": parsedResult.keywords,
                        "note": parsedResult.note,
                        "owner_chat_id": message.author,
                        "image_path": img_path
                    })
                    message.reply(`Your Item "${parsedResult.item.join(" ")}" with item id "${item_id}" has listed successfully`)
                } else {
                    message.reply(`*Invalid format - kindly list item with below format*\n\n!list\n\nitem: _<item_name>_\nowner: _<your_name>_\ncontact: _<contact_no>_\nkeywords: _<keyword-1, keyword-2, keyword-n>_\nnote: _<note (optional)>_`)
                }
            } else {
                message.reply("Please attach the image of item!")
            }
        }

        // Retrieving data (!find items)
        if (message.body.trim().toLocaleLowerCase() === "!find") {
            stat = db.getAllDataAndStatus(".records");

            message.reply(stat)
        }

        // !find args
        const keyword = args[1];

        if (message.body.trim().toLocaleLowerCase().startsWith("!find ") && message.body.trim().toLocaleLowerCase().endsWith("available")) {
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
                        const caption = `Item ID: ${e.id}\n\nItem: ${e.item.join(" ")}\nOwner: ${e.owner}\nContact: ${e.contact}\nStatus: ${e.available ? "available" : "not available"} ${(e.note != null) ? "\nNote: "+e.note : "" }`;

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
        } else if (message.body.trim().toLocaleLowerCase().startsWith("!find ") && !message.body.trim().toLocaleLowerCase().endsWith("available")) {
            const stat = db.getDataByKeywords(".records", keyword)

            if (!stat) {
                message.reply("Item not found")

            } else {
                stat.forEach(e => {
                    // Assuming you have the image data in e.image_path, adjust accordingly
                    const imageBuffer = fs.readFileSync(e.image_path); // Read the image file

                    const media = new MessageMedia('image/jpeg', imageBuffer.toString('base64'));
                    const caption = `Item ID: ${e.id}\n\nItem: ${e.item.join(" ")}\nOwner: ${e.owner}\nContact: ${e.contact}\nStatus: ${e.available ? "available" : "not available"} ${(e.note != null) ? "\nNote: "+e.note : "" }`;

                    client.sendMessage(message.from, media, {
                        caption: caption
                    });
                });
            }

        } else if (message.body.trim().toLocaleLowerCase().startsWith("!find ")) {
            message.reply("*Invalid format* - !find <keyword> available")
        }

        // unlisting item
        if (message.body.trim().toLocaleLowerCase() == "!unlist") {} else if (message.body.trim().toLocaleLowerCase().startsWith("!unlist ")) {
            const item_id = args[1];
            const item = db.getDataById(".records", item_id)

            if (!item) {
                message.reply("No such item is listed")
            } else {
                const item_owner_id = item.owner_chat_id
                const item_image_path = item.image_path

                console.log(item)
                if (item_owner_id == message.author) {
                    console.log("owner matched")
                    const stat = db.deleteData(".records", item_id)
                    console.log(stat)
                    if (stat) {
                        fs.unlink(item_image_path, (err) => {
                            if (err) {
                                console.error(`Error deleting file: ${err}`);
                            } else {
                                message.reply(`Your item "${item.item.join(" ")}" has unlisted successfully`)
                            }
                        });
                    } else {
                        message.reply("Error - unable to unlist the item")
                    }
                } else {
                    message.reply("Your don't have rights to unlist this item")
                }
            }
        }
    }

    // transactions group
    if (message.from == transactions) {
        const args = message.body.trim().toLocaleLowerCase().split(/\s+/);
        if (args.length == 3) {

            if (message.body.trim().toLocaleLowerCase().startsWith("!confirm ") && message.body.trim().toLocaleLowerCase().endsWith(" borrow")) {

                const item_id = args[1];
                const item = db.getDataById(".records", item_id)
                if (item) {
                    if (item.available) {
                        const stat = db.updateData(".records", item_id, {
                            "available": false
                        })
                        if (stat) {
                            const transaction_id = db.addData(".transactions", {
                                "item_id": item_id,
                                "type": "borrow",
                                "borrower_contact": message.author,
                                "borrow_duration": null,
                                "borrowed_timestamp": Date.now(),
                                "returned_timestamp": "",
                                "returned": false,
                                "return_ack": false
                            })
                            message.reply(`Your transaction has been recorded, transaction id - ${transaction_id}`)
                        }
                    } else {
                        message.reply("Currently, the item is not available")
                    }
                } else {
                    message.reply("No such item is listed")
                }
            } else if (message.body.trim().toLocaleLowerCase().startsWith("!confirm ") && message.body.trim().toLocaleLowerCase().endsWith(" return")) {
                const item_id = args[1];
                const item = db.getDataById(".records", item_id)
                if (item) {
                    if (!item.available) {

                        const transaction_id = db.getDataById(".transactions", item_id, custom_id_field = true).id
                        const return_stat = db.updateData(".transactions", transaction_id, {
                            "returned_timestamp": Date.now(),
                            "returned": true,
                            "return_ack": false
                        })

                        if (return_stat) {
                            const available_stat = db.updateData(".records", item_id, {
                                "available": true
                            })
                            if (available_stat) {
                                message.reply(`Your return transaction has been recorded, the item is now available for everyone`)
                            }
                        }

                    } else {
                        message.reply("unable to record transaction, item was not borrowed")
                    }
                } else {
                    message.reply("No such item is listed or borrowed")
                }
            } else {
                message.reply("*Invalid Format* - !confirm <Item ID> borrow || !confirm <Item ID> return")
            }


        } else {
            message.reply("*Invalid Format* - !confirm <Item ID> borrow || !confirm <Item ID> return")
        }
    }

});

client.initialize();

function parseListMessage(message) {
    const regex = /^!list\s+item:\s+(.+)\s+owner:\s+(.+)\s+contact:\s*([6-9]\d{9})\s*keywords:\s+([^\n]+)\s*(?:note:\s*(.+)\s*)?$/i;

    const match = message.match(regex);

    if (match) {
        const [, items, ownerName, contactNo, keywords, note] = match;

        // Check for unwanted symbols in items, ownerName, keywords, and note
        const hasUnwantedSymbols = /[$%^()_+={};:'"<>/\\[\]\-\|]/.test(items + ownerName + keywords + (note || ''));

        // Validate Indian contact number format
        const isValidIndianContact = /^[6-9]\d{9}$/.test(contactNo);

        if (!hasUnwantedSymbols && isValidIndianContact) {
            const itemsArray = items.split(' ').map(item => item.trim().toLocaleLowerCase());
            const keywordsArray = keywords.split(',').map(keyword => keyword.trim().toLocaleLowerCase());

            const result = {
                item: itemsArray,
                owner: ownerName.trim().toLocaleLowerCase(),
                contact: contactNo.trim().toLocaleLowerCase(),
                keywords: keywordsArray,
                note: note ? note.trim() : null,
            };

            return result;
        } else {
            return null; // Names, keywords, note, or item names contain unwanted symbols, or invalid contact format
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