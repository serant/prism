const mongoose = require('mongoose');

const ConversionSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    fileName: {
        type: String,
        require: true
    },
    colors: {
        type: Array,
        require: true
    }
});

module.exports = mongoose.model('Conversion', ConversionSchema);