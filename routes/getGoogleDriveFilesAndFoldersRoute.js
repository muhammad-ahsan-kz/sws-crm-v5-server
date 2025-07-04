const express = require("express");
const router = express.Router();

const {
    getDriveFolderStructure,
    mapItemsToFoldersAndFiles,
} = require("../controllers/getGoogleDriveFilesAndFolder");

router.post("/get-google-drive-files-and-folders", async (req, res) => {
    try {
        const { folderUrl } = req.body;

        if (!folderUrl) {
            return res.status(400).json({
                error: "folderUrl is required in body",
            });
        }

        const items = await getDriveFolderStructure(folderUrl);

        const mappedItems = await mapItemsToFoldersAndFiles(items);

        return res.json(mappedItems);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message,
        });
    }
});

module.exports = router;







// const express = require("express");
// const router = express.Router();
// const {
//     getDriveFolderStructure,
//     flattenItems
// } = require("../controllers/getGoogleDriveFilesAndFolder");

// router.post("/get-google-drive-files-and-folders", async (req, res) => {
//     try {
//         const { folderUrl, recursive } = req.body;

//         if (!folderUrl) {
//             return res.status(400).json({
//                 error: "folderUrl is required in body"
//             });
//         }

//         const nestedItems = await getDriveFolderStructure(folderUrl);

//         if (recursive) {
//             const flatItems = flattenItems(nestedItems);
//             return res.json(flatItems);
//         } else {
//             return res.json(nestedItems);
//         }
//     } catch (err) {
//         console.error(err);
//         return res.status(500).json({
//             error: err.message
//         });
//     }
// });

// module.exports = router;
