const {
    loadJSONFile,
    saveJSONFile
} = require("../helpers/helpers.js");

// Update a data object in a JSON file
function updateData(DB_DIR, filename, id, newData) {
    const data = loadJSONFile(DB_DIR, filename);
    const index = data.findIndex(d => d.id === id);
    if (index === -1) {
        return false;
    }
    const oldData = data[index];
    const updatedData = {
        ...oldData,
        ...newData
    };
    updatedData.id = id;
    data[index] = updatedData;
    saveJSONFile(DB_DIR, filename, data);
    return true;
}

// export the module
module.exports = updateData;