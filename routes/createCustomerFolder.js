const express = require("express");
const router = express.Router();
const { findOrCreateFolder } = require("../services/googleDriveServices");

router.post("/create-customer-folder", async (req, res) => {
    const { customerId } = req.body;

    if (!customerId) {
        return res.status(400).json({ error: "customerId is required" });
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

        res.json({
            status: "success",
            folderLink: customerFolder.link,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

