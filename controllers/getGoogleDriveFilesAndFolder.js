const { google } = require("googleapis");
require("dotenv").config();

const rawCreds = process.env.GOOGLE_DRIVE_CREDENTIALS;
const googleCreds = JSON.parse(rawCreds);
googleCreds.private_key = googleCreds.private_key.replace(/\\n/g, "\n");

const auth = new google.auth.GoogleAuth({
    credentials: googleCreds,
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

// Extract folder ID from Drive URL
function extractFolderIdFromUrl(url) {
    const match = url.match(/\/folders\/([^/?]+)/);
    if (!match) {
        throw new Error("Invalid folder URL");
    }
    return match[1];
}

// Format bytes to human-readable size
function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Fetch only immediate files & folders inside a given folder
async function getGoogleDriveFilesAndFolders(folderId) {
    const items = [];

    const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "files(id, name, mimeType, size)",
        pageSize: 1000,
    });

    for (const file of res.data.files) {
        const isFolder = file.mimeType === "application/vnd.google-apps.folder";

        const item = {
            id: file.id,
            name: file.name,
            type: isFolder ? "folder" : "file",
            size: isFolder ? 0 : Number(file.size || 0),
            mimeType: isFolder ? null : file.mimeType,
        };

        items.push(item);
    }

    return items;
}

// Entry point from URL
async function getDriveFolderStructure(folderUrl) {
    const folderId = extractFolderIdFromUrl(folderUrl);
    return await getGoogleDriveFilesAndFolders(folderId);
}

// Map items into folders/files with counts
async function mapItemsToFoldersAndFiles(items) {
    const result = {
        folders: [],
        files: [],
    };

    for (const item of items) {
        if (item.type === "folder") {
            // List immediate children of this folder
            const childrenRes = await drive.files.list({
                q: `'${item.id}' in parents and trashed = false`,
                fields: "files(id, mimeType)",
                pageSize: 1000,
            });

            let folderCount = 0;
            let fileCount = 0;

            for (const child of childrenRes.data.files) {
                if (child.mimeType === "application/vnd.google-apps.folder") {
                    folderCount++;
                } else {
                    fileCount++;
                }
            }

            result.folders.push({
                name: item.name,
                url: `https://drive.google.com/drive/folders/${item.id}`,
                items: folderCount + fileCount,
                foldercount: folderCount,
                filescount: fileCount,
            });
        } else {
            result.files.push({
                name: item.name,
                size: formatBytes(item.size),
                type: item.mimeType,
                url: `https://drive.google.com/file/d/${item.id}/view`,
            });
        }
    }

    return result;
}

module.exports = {
    getDriveFolderStructure,
    mapItemsToFoldersAndFiles,
};




// // controllers/getGoogleDriveFilesAndFolder.js

// const { google } = require("googleapis");
// require("dotenv").config();

// const rawCreds = process.env.GOOGLE_DRIVE_CREDENTIALS;
// const googleCreds = JSON.parse(rawCreds);
// googleCreds.private_key = googleCreds.private_key.replace(/\\n/g, "\n");

// const auth = new google.auth.GoogleAuth({
//     credentials: googleCreds,
//     scopes: ["https://www.googleapis.com/auth/drive"],
// });

// const drive = google.drive({ version: "v3", auth });

// function extractFolderIdFromUrl(url) {
//     const match = url.match(/\/folders\/([^/?]+)/);
//     if (!match) {
//         throw new Error("Invalid folder URL");
//     }
//     return match[1];
// }

// async function getGoogleDriveFilesAndFolder(folderId) {
//     const items = [];

//     const res = await drive.files.list({
//         q: `'${folderId}' in parents and trashed = false`,
//         fields: 'files(id, name, mimeType)',
//         pageSize: 1000,
//     });

//     for (const file of res.data.files) {
//         const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
//         const item = {
//             name: file.name,
//             type: isFolder ? 'folder' : 'file',
//         };

//         if (isFolder) {
//             item.children = await getGoogleDriveFilesAndFolder(file.id);
//         }

//         items.push(item);
//     }

//     return items;
// }

// async function getDriveFolderStructure(folderUrl) {
//     const folderId = extractFolderIdFromUrl(folderUrl);
//     return await getGoogleDriveFilesAndFolder(folderId);
// }

// function flattenItems(items, result = []) {
//     for (const item of items) {
//         result.push({ name: item.name, type: item.type });
//         if (item.type === 'folder' && item.children) {
//             flattenItems(item.children, result);
//         }
//     }
//     return result;
// }

// // ✅ EXPORT your functions!
// module.exports = {
//     getDriveFolderStructure,
//     flattenItems
// };
