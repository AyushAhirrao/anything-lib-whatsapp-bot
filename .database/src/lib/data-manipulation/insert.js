const {
    loadJSONFile,
    saveJSONFile
} = require("../helpers/helpers.js");

// Add a new data object to a JSON file
 function addData(DB_DIR, filename, newData) {
    const data = loadJSONFile(DB_DIR, filename);
    newData.id = data.length > 0 ? data[data.length - 1].id + 1 : 1;
    data.push(newData);
    saveJSONFile(DB_DIR, filename, data);
    return newData.id;
}

// export the module
module.exports = addData;