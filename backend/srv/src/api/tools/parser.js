const HISTO_REGEX = /(\d+): \(([0-9 ]{1,5}),([0-9 ]{1,5}),([0-9 ]{1,5}),([0-9 ]{1,5})\) #([0-9A-F]{1,16}) ([A-Za-z0-9(),.]+)/;
const im = require('imagemagick');

function parseColors(uploadPath) {
    return new Promise((resolve, reject) => {
        const convertCommand = [
            uploadPath,
            '-define', 
            'histogram:unique-colors=true', 
            '-format', 'pdf_page: %s\n%c', 
            '-depth', '7', 
            'histogram:info:-'
        ];

        im.convert(convertCommand, function(err, stdout) {
            
            if (err) console.error(err);
    
            let pages = [];
            let page = [];
            
            let lines = stdout.split('\n');
    
            for (let i = 0; i < lines.length; i++) {
    
                // If we detect the start of a new page, append the old one to pages
                if (lines[i].indexOf('pdf_page:') != -1 && page.length != 0) {
                    page.push(page);
                    page = [];
                    continue;
                }
                
                // Get our count, RGBA and short name from the line
                let match = lines[i].match(HISTO_REGEX);
    
                const count = match ? parseInt(match[1]) : 0
                ,     r     = match ? parseFloat(match[2]) : null
                ,     g     = match ? parseFloat(match[3]) : null
                ,     b     = match ? parseFloat(match[4]) : null
                ,     a     = match ? parseFloat(match[5]) : null
                ,     name  = match ? match[7] : "";
                
                // If RGB are not equal, append it to list of colours
                if (r != g || r != b || b != g) {
                    page.push({
                        "r": r,
                        "g": g,
                        "b": b,
                        "a": a,
                        "name": name,
                        "count": count,
                        "pageNumber": pages.length + 1
                    });
                }
            }
    
            // Push the last page
            if (page.length != 0) pages.push(page);        
            resolve({
                "fileName": uploadPath,
                "colors": pages,
            });
        });
    });
}


module.exports.parseColors = parseColors;