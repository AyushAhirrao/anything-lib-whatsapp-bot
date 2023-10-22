const { loadJSONFile } = require('../helpers/helpers.js');

// Helper function to group items by their type
function groupItems(data) {
    const groupedItems = {};

    data.forEach(record => {
        // Use the item type as the key for grouping
        const itemType = record.item[0].toLowerCase();

        if (!groupedItems[itemType]) {
            // If the group doesn't exist, create it
            groupedItems[itemType] = {
                type: itemType,
                available: false, // Default to not available
            };
        }

        // Update the group's availability based on the item's availability
        if (record.available) {
            groupedItems[itemType].available = true;
        }
    });

    // Convert the grouped items object to an array
    const result = Object.values(groupedItems);
    return result;
}

// Format data into a text message
function getAllDataAndStatus(DB_DIR, filename) {
    const data = loadJSONFile(DB_DIR, filename);
    const groupedItems = groupItems(data);

    let message = '';
    groupedItems.forEach((group, index) => {
        message += `${index + 1} - ${capitalizeFirstLetter(group.type)} (${group.available ? "available" : "not available"})\n\n`;
    });

    return message.trim(); // Trim to remove trailing newline
}

module.exports = getAllDataAndStatus;

function capitalizeFirstLetter(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }