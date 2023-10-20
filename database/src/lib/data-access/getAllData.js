const {
    loadJSONFile
} = require('../helpers/helpers.js');

// Get all data from a JSON file
function getAllData(DB_DIR, filename) {
    return loadJSONFile(DB_DIR, filename);
}

// export the module
module.exports = getAllData