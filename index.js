
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Import routes
const createProjectFolderRoute = require("./routes/createProjectFolder");
app.use("/", createProjectFolderRoute);

const createCustomerFolderRoute = require("./routes/createCustomerFolder");
app.use("/", createCustomerFolderRoute);

const getGoogleDriveFilesAndFoldersRoute = require("./routes/getGoogleDriveFilesAndFoldersRoute");
app.use("/", getGoogleDriveFilesAndFoldersRoute);

const uploadFilesToCloudinaryRoute = require("./controllers/uploadFilesToCloudinaryController");
app.use("/", uploadFilesToCloudinaryRoute);

// Test route
app.get("/", (req, res) => {
    res.status(200).json("SWS Drive API Running");
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});




