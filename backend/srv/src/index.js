const express = require('express');
const upload = require('express-fileupload');
const mongoose = require('mongoose');

const parser = require('./parser.js');
const Conversion = require('./conversion');

// TODO: This will eventually be our DB (for now it's just an array)
const conversions = [];

// Represents our application
const app = express();

// Attach middleware
app.use(express.json());
app.use(upload());

mongoose.
    connect(
        'mongodb://mongo:27017/expressmongo',
        { useNewUrlParser: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

// _____ ______ _______ 
// / ____|  ____|__   __|
// | |  __| |__     | |   
// | | |_ |  __|    | |   
// | |__| | |____   | |   
// \_____|______|  |_|   

app.get('/',(req, res) => res.status(200).json(
    { message: 'PrismPDF 2019'}
    ));

app.get('/api', (req, res) => res.status(200).json(
        { message: 'PrismPDF API 2019' }
    ));

app.get('/api/conversions', (req, res) => {
    Conversion.find()
        .exec()
        .then( docs => {
            if (docs) return res.status(200).json(docs);
            else return res.status(404).json(
                { message: "No entries for conversions." });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
});

app.get('/api/conversions/:id', (req, res) => {
    Conversion.findById(req.params.id)
        .exec()
        .then(doc => {
            if (doc) return res.status(200).json(doc);
            else return res.status(404).json(
                { message: 'No valid entry for the provided id.' });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
        });
});

// _____   ____   _____ _______ 
// |  __ \ / __ \ / ____|__   __|
// | |__) | |  | | (___    | |   
// |  ___/| |  | |\___ \   | |   
// | |    | |__| |____) |  | |   
// |_|     \____/|_____/   |_|   
                              
app.post('/api/conversions', (req, res) => {

    if (!req.files) return res.status(400).json(
        { message: 'Must include file of type .pdf.'});

    let file = req.files.file;
    if (file.name.split('.')[1] != 'pdf') return res.status(400).json(
        { message: 'File type must be .pdf.' });

    let uploadPath = `${__dirname}/uploads/${file.name}`;
    
    file.mv(uploadPath, (err) => {
        if (err) {
            console.error(err);
            return res.status(400).json({ error: err});
        }

        else {
            parser.parseColors(uploadPath, function(result) {
                const conversion = new Conversion({
                    _id: mongoose.Types.ObjectId(),
                    fileName: result['fileName'],
                    colors: result['colors']
                });

                conversion.save().then((result) => {
                    console.log(result);
                    return res.status(200).json(conversion);
                })

                .catch((err) => {
                    console.error(err);
                    return res.status(500).json({ error: err });
                });
            });
        }
    });
});

// _____  _    _ _______ 
// |  __ \| |  | |__   __|
// | |__) | |  | |  | |   
// |  ___/| |  | |  | |   
// | |    | |__| |  | |   
// |_|     \____/   |_|   
                       
app.put('/api/conversions/:id', (req, res) => {

    // See if conversion exists
    Conversion.findById(req.params.id)
        .exec()
        .then( doc => {
            if (!doc) return res.status(404).json(
                { message: 'No valid entry for the provided id.' }
            );
            
            if (!req.files) return res.status(400).json(
                { message: 'Must include file of type .pdf.' }
            );
    
            let file = req.files.file;
            if (file.name.split('.')[1] != 'pdf') return res.status(400).json(
                { message: 'File type must be .pdf.' }
            );
    
            // Now update the entity
            let uploadPath = `${__dirname}/uploads/${file.name}`;
            file.mv(uploadPath, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: err });
                }
                else {
                    parser.parseColors(uploadPath, function(result) {
                        Conversion.updateOne({_id: doc._id}, 
                            { $set: { 
                                fileName: result['fileName'], 
                                colors: result['colors']
                        }})
                        .exec()
                        .then( result => {
                            console.log(result);
                            return res.status(200).json(result);
                        })
                        .catch( err => {
                            console.error(err);
                            return res.status(501).json({ error: err });
                        });
                    });
                }
            });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err });
    });
});

// _____  ______ _      ______ _______ ______ 
// |  __ \|  ____| |    |  ____|__   __|  ____|
// | |  | | |__  | |    | |__     | |  | |__   
// | |  | |  __| | |    |  __|    | |  |  __|  
// | |__| | |____| |____| |____   | |  | |____ 
// |_____/|______|______|______|  |_|  |______|
                                            
app.delete('/api/conversions/:id', (req, res) => {
    Conversion.remove({_id: req.params.id})
    .exec()
    .then( result => {
        return res.status(200).json(result);
    })
    .catch( err => {
        console.error(err);
        return res.status(500).json({ error: err });
    });
});

// _____  _    _ _   _ 
// |  __ \| |  | | \ | |
// | |__) | |  | |  \| |
// |  _  /| |  | | . ` |
// | | \ \| |__| | |\  |
// |_|  \_\\____/|_| \_|
                     
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.info(`Listening on port ${port}...`);
});
