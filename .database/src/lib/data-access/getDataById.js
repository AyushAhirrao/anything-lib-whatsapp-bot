const { loadJSONFile } = require('../helpers/helpers.js');

// Get a single data object from a JSON file by ID
function getDataById(DB_DIR, filename, id) {
    const data = loadJSONFile(DB_DIR, filename);
    const foundData = data.find(d => d.id === id);

    return foundData || false;
}

// export the module
module.exports = getDataById;
