const {
    loadJSONFile
} = require('../helpers/helpers.js');

// Get a single data object from a JSON file by ID
function getDataById(DB_DIR, filename, id) {
    const data = loadJSONFile(DB_DIR, filename);
    return data.find(d => d.id === id);
}

// export the module
module.exports = getDataById;