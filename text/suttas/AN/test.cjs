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
  
  // Example usage:
  const inputString = "hello world ROBERT-SMITH";
  const capitalizedString = capitalizeWordsWithHyphens(inputString);
  console.log(capitalizedString); // Output: "Hello World Robert-Smith"
  