
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

// Test route
app.get("/", (req, res) => {
    res.status(200).json("SWS Drive API Running");
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});









// // Import required modules
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { google } = require("googleapis");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // ************************ Update Unread Messages ************************
// // const updateUnreadMessagesRoute = require("./update_unread_messages");
// // app.use("/", updateUnreadMessagesRoute);
// // ************************ Update Unread Messages ************************



// // ✅ Use credentials instead of keyFile
// const auth = new google.auth.GoogleAuth({
//     credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
//     scopes: ["https://www.googleapis.com/auth/drive"],
// });

// const drive = google.drive({ version: "v3", auth });

// // 📁 Create Google Drive folder
// app.post("/create-folder", async (req, res) => {
//     const { projectName } = req.body;

//     if (!projectName) {
//         return res.status(400).json({ error: "projectName is required" });
//     }

//     try {
//         const folderMetadata = {
//             name: projectName,
//             mimeType: "application/vnd.google-apps.folder",
//             parents: ["1o07OIt9PMh6K5MoKCCbQKpCR8rv9ue8b"], // Parent Folder ID
//         };

//         const folder = await drive.files.create({
//             resource: folderMetadata,
//             fields: "id",
//         });

//         const folderId = folder.data.id;
//         const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

//         res.json({ status: "success", folderLink });
//     } catch (error) {
//         console.error("Error:", error.message);
//         res.status(500).json({ error: error.message });
//     }
// });

// // ✅ Test route
// app.get("/", (req, res) => {
//     res.status(200).json("SWS Drive API Running");
// });

// app.listen(process.env.PORT || 3000, () => {
//     console.log(`Server running on port ${process.env.PORT || 3000}`);
// });
