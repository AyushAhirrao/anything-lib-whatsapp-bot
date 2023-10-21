const {
    loadJSONFile,
    saveJSONFile
} = require("../helpers/helpers.js");
const crypto = require("crypto")

// Generate a unique 8-digit ID
function generateUniqueID(data) {
    return crypto.randomUUID();
}

// Add a new data object to a JSON file
function addData(DB_DIR, filename, newData) {
    const data = loadJSONFile(DB_DIR, filename);
    newData.id = generateUniqueID(data);
    data.push(newData);
    saveJSONFile(DB_DIR, filename, data);
    return newData.id;
}

// export the module
module.exports = addData;
