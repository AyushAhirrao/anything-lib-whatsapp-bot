const {
    loadJSONFile
} = require('../helpers/helpers.js');

// Get data objects from a JSON file by keyword
function getDataByKeywords(DB_DIR, filename, keyword) {
    const data = loadJSONFile(DB_DIR, filename);
    return data.filter(d => d.keywords && d.keywords.includes(keyword));
}

// export the module
module.exports = getDataByKeywords;
