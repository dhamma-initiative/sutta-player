const fs = require('fs');
const path = require('path');

// Specify the directory where you want to search for *.txt files
const directoryPath = '.';

function capitalizeWordsWithHyphens(inputString) {
  // Split the input string into words using space as separator
  const words = inputString.split(' ');

  // Process each word, retaining hyphens
  const capitalizedWords = words.map((word) => {
    if (word.length === 0) {
      return ''; // Handle empty strings or spaces
    }
    
    // Split word into parts using hyphen as separator
    const parts = word.split('-');
    const capitalizedParts = parts.map((part) => {
      if (part.length === 0) {
        return ''; // Handle empty parts
      }
      return part[0].toUpperCase() + part.slice(1).toLowerCase();
    });
    
    // Join capitalized parts with hyphens and return
    return capitalizedParts.join('-');
  });

  // Join the capitalized words into a single string using space as separator
  return capitalizedWords.join(' ');
}

fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter files to keep only *.txt files
  const txtFiles = files.filter((file) => file.endsWith('.txt'));

  // Iterate through each *.txt file
  txtFiles.forEach((txtFile) => {
    const filePath = path.join(directoryPath, txtFile);

    // Read the first line of the file
    const lines = fs.readFileSync(filePath, 'utf8').split('\n')
    let data = lines[0]// + ' ' + lines[1]
    let pos = -1 //data.indexOf(':')
    const substring = capitalizeWordsWithHyphens(data.substring(pos+1).trim())

    // Output filename and substring as comma-delimited fields
    console.log(`${txtFile}, ${substring}`);
  });
});
