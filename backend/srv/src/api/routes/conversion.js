const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Conversion = require('../models/conversion');
const parser = require('../tools/parser');
const fs = require('fs');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        uploadPath = process.env.PDF_UPLOAD_PATH || `${__dirname}/../../../uploads/`;
        callback(null, uploadPath);
    },
    filename: function(req, file, callback) {
        callback(null, new Date().toISOString() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === 'application/pdf') { 
        callback(null, true); // Allow the file to be uploaded
    } 
    else {
        callback(null, false); // Don't upload the file
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 32
    },
    fileFilter: fileFilter
});


router.get('/', (req, res) => {
    Conversion.find()
        .select('_id content')
        .exec()
        .then( docs => {
            const response = {
                count: docs.length,
                conversions: docs.map( doc => {
                    return {
                        _id: doc._id,
                        content: doc.content,
                        request: {
                            type: 'GET',
                            url: `http://localhost:3000/api/conversions/${doc._id}`
                        }
                    };
                })
            };
            return res.status(200).json(response);
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
});

router.post('/', upload.single('conversionPdf'),(req, res) => {    
    if (!req.file) {
        return res.status(500).json({
            message: 'Invalid file format. Must be of type .pdf and less than 32 MB.'
        });
    }
    
    // First parse the pdf to extract color values
    parser.parseColors(req.file.path)

    // Delete file and save entry in DB
    .then( parseResult => {
        fs.unlinkSync(req.file.path);
        return conversion = new Conversion({
            _id: mongoose.Types.ObjectId(),
            content: parseResult['content']
        }).save();
    })

    .then(

    )

    // Send appropriate response
    .then( result => {
        return res.status(200).json({
            message: "Created conversion successfully",
            createdConversion: {
                _id: result._id,
                content: result.content
            },
            request: {
                type: 'GET',
                url: `http://localhost:3000/api/conversions/${result._id}`
            }
        });
    })

    // Return errors under 500
    .catch( err => {
        console.error(err);
        return res.status(500).json({ error: err });
    });
});

router.get('/:id', (req, res) => {
    Conversion.findById(req.params.id)
        .exec()
        .then(doc => {
            if (doc) {
                res.status(200).json({
                    conversion: doc,
                    request: {
                        type: 'GET',
                        description: 'Get all conversions',
                        url: 'http://localhost/api/conversions'
                    }
                });
            }
            else return res.status(404).json(
                { message: 'No valid entry for the provided id.' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
});

router.put('/:id', upload.single('conversionPdf'), (req, res) => {
    const id = req.params.id;
    
    if (!req.file) {
        return res.status(500).json({
            message: 'Invalid file format. Must be of type .pdf and less than 32 MB.'
        });
    }

    // First parse the pdf to extract color values
    parser.parseColors(req.file.path)
    
    // Delete file and update entry in DB
    .then( parseResult => {
        fs.unlinkSync(req.file.path);
        return Conversion.updateOne({_id: id}, 
            { $set: { 
                content: parseResult['content']
        }}).exec();
    })

    // Send response
    .then(result => {
        return res.status(200).json({
            message: "Updated conversion successfully",
            request: {
                type: 'GET',
                url: `http://localhost:3000/api/conversions/${id}`
            }
        });
    })
    .catch( err => {
        console.error(err);
        return res.status(501).json({ error: err });
    });
});

router.delete('/:id', (req, res) => {
    Conversion.deleteOne({_id: req.params.id})
    .exec()
    .then( result => {
        return res.status(200).json({
            message: 'Conversion deleted',
            request: {
                type: 'POST',
                url: 'http://localhost:3000/conversions',
                body: { file: '<pdf_file>' }
            }
        });
    })
    .catch( err => {
        console.error(err);
        return res.status(500).json({ error: err });
    });
});

module.exports = router;