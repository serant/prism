const express = require('express');
const upload = require('express-fileupload');

const parser = require('./parser.js');

// TODO: This will eventually be our DB (for now it's just an array)
const conversions = [];

// Represents our application
const app = express();

// Attach middleware
app.use(express.json());
app.use(upload());

// _____ ______ _______ 
// / ____|  ____|__   __|
// | |  __| |__     | |   
// | | |_ |  __|    | |   
// | |__| | |____   | |   
// \_____|______|  |_|   

app.get('/',(req, res) => {
    res.send('PrismPDF 2019');
});

app.get('/api', (req, res) => {
   res.send('PrismPDF API 2019');
});

app.get('/api/conversions', (req, res) => {
    res.send(conversions);
});

app.get('/api/conversions/:id', (req, res) => {
    const conversion = conversions.find(c => c.id === parseInt(req.params.id));
    if (!conversion) return res.status(404).send('The conversion with the given ID was not found.');

    res.send(conversion);
});

// _____   ____   _____ _______ 
// |  __ \ / __ \ / ____|__   __|
// | |__) | |  | | (___    | |   
// |  ___/| |  | |\___ \   | |   
// | |    | |__| |____) |  | |   
// |_|     \____/|_____/   |_|   
                              
app.post('/api/conversions', (req, res) => {

    if (!req.files) return res.status(400).send('Must include file of type .pdf.');

    let file = req.files.file;
    if (file.name.split('.')[1] != 'pdf') return res.status(400).send('File type must be .pdf.');

    let uploadPath = `${__dirname}/uploads/${file.name}`;
    
    file.mv(uploadPath, (err) => {
        if (err) {
            res.status(400).send('An exception occured.');
            console.error(err);
            return;
        }

        else {
            parser.parseColors(uploadPath, function(result) {
                let conversion =  {
                    id: conversions.length + 1, 
                    fileName: result['fileName'], 
                    colors: result['colors'], 
                };
                conversions.push(conversion);
                res.send(conversion);             
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
    const conversion = conversions.find(c => c.id === parseInt(req.params.id));
    if (!conversion) return res.status(404).send('The conversion with the given ID was not found.');
    
    if (!req.files) return res.status(400).send('Must include file of type .pdf.');

    let file = req.files.file;
    if (file.name.split('.')[1] != 'pdf') return res.status(400).send('File type must be .pdf.');

    // Update the entry at the given id
    let uploadPath = `${__dirname}/uploads/${file.name}`;
    
    file.mv(uploadPath, (err) => {
        if (err) {
            res.status(400).send('An exception occured.');
            console.error(err);
            return;
        }

        else {
            parser.parseColors(uploadPath, function(result) {
                
                conversion.fileName = result['fileName'];
                conversion.colors = result['colors'];
                
                res.send(conversion);             
            });
        }
    });
});

// _____  ______ _      ______ _______ ______ 
// |  __ \|  ____| |    |  ____|__   __|  ____|
// | |  | | |__  | |    | |__     | |  | |__   
// | |  | |  __| | |    |  __|    | |  |  __|  
// | |__| | |____| |____| |____   | |  | |____ 
// |_____/|______|______|______|  |_|  |______|
                                            
app.delete('/api/conversions/:id', (req, res) => {
    // See if conversion exists
    const conversion = conversions.find(c => c.id === parseInt(req.params.id));
    if (!conversion) return res.status(404).send('The conversion with the given ID was not found.');

    // Delete and return conversion
    const i = conversions.indexOf(conversion);
    conversions.splice(i, 1);
    res.send(conversion);
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
