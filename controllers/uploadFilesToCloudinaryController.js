const cloudinary = require('../services/cloudinaryServices');
const multer = require('multer');
const express = require('express');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

const getResourceType = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'video';
    return 'raw';
};

const uploadToCloudinary = (fileBuffer, originalName, mimeType) => {
    const resourceType = getResourceType(mimeType);

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                resource_type: resourceType,
                folder: 'SWS CRM v5/Message Attachments',
                public_id: `SWS CRM v5/Message Attachments/${originalName}`,
                use_filename: true,
                unique_filename: false,
                overwrite: true
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        stream.end(fileBuffer);
    });
};

router.post('/uploadFilesToCloudinary', upload.array('files'), async (req, res) => {
    try {
        const urls = [];

        for (const file of req.files) {
            const url = await uploadToCloudinary(
                file.buffer,
                file.originalname,
                file.mimetype
            );
            urls.push(url);
        }

        return res.status(200).json({ urls });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Upload failed',
            error: e.message || e,
        });
    }
});

module.exports = router;
