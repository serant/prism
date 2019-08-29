const HISTO_REGEX = /(\d+): \(([0-9 ]{1,5}),([0-9 ]{1,5}),([0-9 ]{1,5}),([0-9 ]{1,5})\) #([0-9A-F]{1,16}) ([A-Za-z0-9(),.]+)/;
// const im = require('imagemagick');
const gm = require('gm').subClass({imageMagick: true});
const fs = require('fs');

function parseColors(uploadPath) {
    return new Promise((resolve, reject) => {
        let readStream = fs.createReadStream(uploadPath);
        
        gm(readStream)
        .define('histogram:unique-colors:true')
        .bitdepth(7)
        .in('-format', 'pdf_page: %s\n%c')
        .write('histogram:info:-', (err, stdout) => {
            if (err) throw err;
            let histoData = stdout.split(/pdf_page: \d{1,5}\n/);
            histoData.shift();

            let pages = [];
            for (let i = 0; i < histoData.length; i++) {
                
                let pageSpectrum = 'gs';
                
                let lines = histoData[i].split('\n');
                for (let n = 0; n < lines.length; n++) {
                    const match = lines[n].match(HISTO_REGEX);
                    const count = match ? parseInt(match[1]) : 0
                    ,     r     = match ? parseFloat(match[2]) : 0
                    ,     g     = match ? parseFloat(match[3]) : 0
                    ,     b     = match ? parseFloat(match[4]) : 0
                    ,     a     = match ? parseFloat(match[5]) : 0
                    ,     name  = match ? match[7] : ""; 
                    if (r != g || r != b || b != g) {
                        pageSpectrum = 'rgb';
                        break;
                    }
                }
                
                pages.push({
                    'pageNumber': i+1,
                    'spectrum': pageSpectrum
                });               
            }
            resolve({
                "content": pages,
            });
        });
    });       
}

module.exports.parseColors = parseColors;