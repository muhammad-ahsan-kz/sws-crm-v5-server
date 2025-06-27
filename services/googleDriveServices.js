const { google } = require("googleapis");
require("dotenv").config();
const rawCreds = process.env.GOOGLE_DRIVE_CREDENTIALS;

if (!rawCreds) {
    throw new Error("Missing GOOGLE_DRIVE_CREDENTIALS env variable");
}

const googleCreds = JSON.parse(rawCreds);

// ✅ CRUCIAL STEP:
googleCreds.private_key = googleCreds.private_key.replace(/\\n/g, '\n');

const auth = new google.auth.GoogleAuth({
    credentials: googleCreds,
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

/**
 * Find or create a folder under a parent
 * @param {string} name
 * @param {string} parentId
 * @returns {Promise<{id:string, link:string}>}
 */
async function findOrCreateFolder(name, parentId) {
    // Search for folder
    const query = `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

    const list = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
    });

    if (list.data.files.length > 0) {
        const folderId = list.data.files[0].id;
        const folderLink = `https://drive.google.com/drive/folders/${folderId}`;
        return { id: folderId, link: folderLink };
    }

    // Create folder
    const file = await drive.files.create({
        resource: {
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id',
    });

    const folderId = file.data.id;
    const folderLink = `https://drive.google.com/drive/folders/${folderId}`;

    return { id: folderId, link: folderLink };
}

module.exports = {
    findOrCreateFolder,
};

