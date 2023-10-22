const database = require("./.database")

const db = database()
const return_stat = db.updateData(".transactions", item_id, {
    "returned_timestamp": Date.now(),
    "returned": true,
    "return_ack": false
})

console.log()