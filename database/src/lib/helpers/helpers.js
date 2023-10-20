const fs = require('fs');
const path = require('path');

// Helper function to load a JSON file
function loadJSONFile(DB_DIR, filename) {
    const filePath = path.join(DB_DIR, `${filename}.json`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileContent);
}

// Helper function to save a JSON file
function saveJSONFile(DB_DIR, filename, data) {
    const filePath = path.join(DB_DIR, `${filename}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// export the module
module.exports = {
    loadJSONFile,
    saveJSONFile
}