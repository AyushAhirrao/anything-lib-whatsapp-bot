const {
    loadJSONFile
} = require('../helpers/helpers.js');

// Get a single data object from a JSON file by ID
function getDataById(DB_DIR, filename, id, custom_id_field = false) {

    if (custom_id_field) {
        const data = loadJSONFile(DB_DIR, filename);

        // Filter data to include only objects with the specified item_id
        const filteredData = data.filter(d => d.item_id === id);

        // Find the object with the latest borrowed_timestamp
        const latestObject = filteredData.reduce((latest, current) => {
            if (!latest || current.borrowed_timestamp > latest.borrowed_timestamp) {
                return current;
            }
            return latest;
        }, null);

        return latestObject || false;
    } else {
        const data = loadJSONFile(DB_DIR, filename);
        const foundData = data.find(d => d.id === id);

        return foundData || false;
    }
}

// export the module
module.exports = getDataById;