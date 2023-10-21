const {
    loadJSONFile,
    saveJSONFile
} = require("../helpers/helpers.js");
// Delete a data object from a JSON file by ID
function deleteData(DB_DIR, filename, id, fields) {
    const data = loadJSONFile(DB_DIR, filename);
    const index = data.findIndex(d => d.id === id);
    if (index === -1) {
        return false;
    }
    if (!fields) {
        data.splice(index, 1);
    } else {
        const oldData = data[index];
        const updatedData = {
            ...oldData
        };
        fields.forEach(field => {
            delete updatedData[field];
        });
        updatedData.id = id;
        data[index] = updatedData;
    }
    saveJSONFile(DB_DIR, filename, data);
    return true;
}

// export the module
module.exports = deleteData;