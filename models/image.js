const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    url: {
        type: 'String',
    },

    subImages: [
        {
            type: 'String',
        }
    ]
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;