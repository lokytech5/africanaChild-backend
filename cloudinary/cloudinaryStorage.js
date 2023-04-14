const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const cloudinary = require('./cloudinaryConfig');

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'avatars',
        allowed_formats: ['jpg', 'png'],
        public_id: (req, file) => {
            const fileNameWithoutExtension = path.parse(file.originalname).name;
            return fileNameWithoutExtension;
        },
        transformation: [{ width: 150, height: 150, crop: 'fill', gravity: 'face' }],
    },
});

module.exports = storage;