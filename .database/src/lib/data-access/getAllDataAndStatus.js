const { loadJSONFile } = require('../helpers/helpers.js');

// Format data into a text message
function getAllDataAndStatus(DB_DIR, filename) {
    data = loadJSONFile(DB_DIR, filename)
    let message = '';
    data.forEach((record, index) => {
        message += `${index + 1} - ${record.item}  (${record.available ? "available" : "not available"})\n\n`;
    });
    return message.trim(); // Trim to remove trailing newline
}

module.exports = getAllDataAndStatus;