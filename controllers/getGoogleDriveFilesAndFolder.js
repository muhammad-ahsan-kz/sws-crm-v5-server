// controllers/getGoogleDriveFilesAndFolder.js

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

function extractFolderIdFromUrl(url) {
    const match = url.match(/\/folders\/([^/?]+)/);
    if (!match) {
        throw new Error("Invalid folder URL");
    }
    return match[1];
}

async function getGoogleDriveFilesAndFolder(folderId) {
    const items = [];

    const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
        pageSize: 1000,
    });

    for (const file of res.data.files) {
        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        const item = {
            name: file.name,
            type: isFolder ? 'folder' : 'file',
        };

        if (isFolder) {
            item.children = await getGoogleDriveFilesAndFolder(file.id);
        }

        items.push(item);
    }

    return items;
}

async function getDriveFolderStructure(folderUrl) {
    const folderId = extractFolderIdFromUrl(folderUrl);
    return await getGoogleDriveFilesAndFolder(folderId);
}

function flattenItems(items, result = []) {
    for (const item of items) {
        result.push({ name: item.name, type: item.type });
        if (item.type === 'folder' && item.children) {
            flattenItems(item.children, result);
        }
    }
    return result;
}

// ✅ EXPORT your functions!
module.exports = {
    getDriveFolderStructure,
    flattenItems
};
