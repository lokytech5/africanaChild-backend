require('dotenv').config();
const User = require('../models/user');
const auth = require('../middleware/auth')
const cloudinary = require('../cloudinary/cloudinaryConfig');
const storage = require('../cloudinary/cloudinaryStorage');
const path = require('path');
const multer = require('multer');
const express = require('express');


const router = express.Router();

const parser = multer({ storage })

//*Retriving thumbnails images from each image folder from cloudinary server
router.get('/', async (req, res) => {
    try {
        const folderNames = ['portrait', 'preWedding', 'studioShots', 'traditionalWedding', 'weddings', 'samples']
        const thumbnails = {};
        for (const folder of folderNames) {
            const searchResult = await cloudinary.search
                .expression(`folder:africanaChildPhotography/${folder}/*`)
                .max_results(50)
                .execute();
            if (searchResult.resources.length > 0) {
                const thumbnailUrl = searchResult.resources[0].secure_url;

                //*Optimizing Images coming from the search results
                const optimizedThumbnailUrl = cloudinary.url(thumbnailUrl, {
                    transformation: [
                        { width: 200, height: 200, crop: 'fill' },
                        { quality: 'auto', fetch_format: 'auto' },
                    ],
                });

                thumbnails[folder] = optimizedThumbnailUrl;
            }

        }
        // const imageUrls = searchResult.resources.map((resource) => resource.secure_url);
        res.status(200).send({ message: 'Thumbnails retrieved successfully', thumbnails });
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving images' });
    }
});


//*Retriving list of images from a particular folder from cloudinary server
router.get('/:folder', async (req, res) => {
    try {
        const folder = req.params.folder;
        const searchResult = await cloudinary.search
            .expression(`folder:africanaChildPhotography/${folder}/*`)
            .max_results(50)
            .execute();

        if (searchResult.resources.length === 0) {
            return res.status(404).send({ error: 'Folder not found or is empty' });
        }

        //*Optimizing Images coming from the search results            
        const imageUrls = searchResult.resources.map((resource) => {
            const optimizedImagerUrl = cloudinary.url(resource.secure_url, {
                transformation: [
                    { width: 200, height: 200, crop: 'fill' },
                    { quality: 'auto', fetch_format: 'auto' },
                ],
            });
            return optimizedImagerUrl;
        })
        res.status(200).send({ message: 'Images retrieved successfully', imageUrls });
    } catch (error) {
        res.status(500).send({ error: 'Error retrieving images' });
    }
});


module.exports = router;