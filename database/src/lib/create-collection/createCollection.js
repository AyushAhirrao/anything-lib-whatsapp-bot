const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

// Create a new JSON file with an empty array
async function createCollection(DB_DIR, filename) {
    const filePath = path.join(DB_DIR, `${filename}.json`);
  
    // Check if file already exists
    if (fs.existsSync(filePath)) {
      // File already exists, prompt user to override
      const response = await prompts({
        type: 'confirm',
        name: 'override',
        message: `The file ${filePath} already exists. Do you want to override it?`,
        initial: false
      });
  
      if (!response.override) {
        // User doesn't want to override file, exit function
        return;
      }
    }
  
    // File doesn't exist or user wants to override it, create new file
    const data = [];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Created new collection: ${filePath}`);
  }
  

// export module
module.exports = createCollection;