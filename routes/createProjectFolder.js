const express = require("express");
const router = express.Router();
const { findOrCreateFolder } = require("../services/googleDriveServices");

router.post("/create-project-folder", async (req, res) => {
    const { customerId, projectId } = req.body;

    if (!customerId || !projectId) {
        return res.status(400).json({ error: "customerId and projectId are required" });
    }

    try {
        // Step 1: Find or create "Customers" folder under ROOT
        const customersFolder = await findOrCreateFolder(
            "Customers",
            process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
        );

        // Step 2: Find or create customer folder under "Customers"
        const customerFolder = await findOrCreateFolder(
            customerId,
            customersFolder.id
        );

        // Step 3: Find or create "Projects" under customer folder
        const projectsFolder = await findOrCreateFolder(
            "Projects",
            customerFolder.id
        );

        // Step 4: Create the project folder under "Projects"
        const projectFolder = await findOrCreateFolder(
            projectId,
            projectsFolder.id
        );

        res.json({
            status: "success",
            folderLink: projectFolder.link,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


