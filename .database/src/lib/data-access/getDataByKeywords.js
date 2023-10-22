const {
    loadJSONFile
} = require('../helpers/helpers.js');

// Get data objects from a JSON file by keyword
function getDataByKeywords(DB_DIR, filename, keyword) {
    const data = loadJSONFile(DB_DIR, filename);
    const matchingData = data.filter(d => (
        (
            (d.id && d.id === keyword) ||
            (d.item && d.item.map(i => i.toLowerCase()).includes(keyword.toLowerCase())) ||
            (d.keywords && d.keywords.map(k => k.toLowerCase()).includes(keyword.toLowerCase()))
        )

    ));

    return matchingData.length > 0 ? matchingData : false;
}

// export the module
module.exports = getDataByKeywords;