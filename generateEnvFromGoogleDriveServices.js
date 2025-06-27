const fs = require("fs");

// Step 1: Read the original JSON file
const raw = fs.readFileSync("googleDriveCredentials.json", "utf8");
const json = JSON.parse(raw);

// Step 2: Replace actual newlines in the private key with \n
json.private_key = json.private_key.replace(/\n/g, "\\n");

// Step 3: Convert back to single-line JSON string
const singleLine = JSON.stringify(json);

// Step 4: Print the string so you can copy it
console.log(singleLine);
