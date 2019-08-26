import ImageStats from "./imageStats";
import { getDocument } from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
let JSZip = require("jszip");

// TODO
// Need to predict when browser is overloaded and call backend services appropriately

function checkTextColor(pdfPage) {
  let texts;
  return new Promise((resolve, reject) => {
    pdfPage
      .getTextContent()
      .then(content => {
        texts = content.items;
        return _renderCanvasToPage(pdfPage);
      })
      .then(imgData => {
        return _checkForColor(imgData, texts);
      })
      .then(isColor => {
        resolve(isColor);
      })
      .catch(e => {
        console.log(e);
        reject(e);
      });
  });
}

function _checkResolvedImage(pdfPage) {
  return new Promise((resolve, reject) => {
    pdfPage.objs.get(`img_p${pdfPage.pageIndex}_${1}`, img => {
      // return img.src ? true : false;
      if (img.src || img.data) resolve(true);
      else resolve(null);
    });
  });
}

function checkPDFPageColor(pdfPage) {
  const scale = 1.0;
  const viewport = pdfPage.getViewport(scale);
  const canvas = document.createElement("canvas");
  const canvasContext = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  return new Promise((resolve, reject) => {
    pdfPage
      .render({
        canvasContext,
        viewport
      })
      .promise.then(() => {
        const data = canvasContext.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) {
            return resolve(true);
          }
        }
        resolve(false);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function checkCanvasColor(pdfPage) {
  const scale = 1.0;
  const viewport = pdfPage.getViewport(scale);
  const canvas = document.createElement("canvas");
  const canvasContext = canvas.getContext("2d");

  return new Promise((resolve, reject) => {
    // First see if images exist on the page
    // Then get the image data of the context
    // Parse the image data to see if there is color content
    _checkResolvedImage(pdfPage)
      .then(imageExists => {
        // if (!imageExists) resolve(false);

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        return pdfPage.render({
          canvasContext,
          viewport
        }).promise;
      })

      .then(() => {
        const data = canvasContext.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) {
            return resolve(true);
          }
        }
        resolve(false);
      });
  });
}

function _renderCanvasToPage(pdfPage) {
  let viewport = pdfPage.getViewport(1);
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  let renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  return pdfPage.render(renderContext).then(() => {
    return context.getImageData(0, 0, viewport.width, viewport.height);
  });
}

function _checkForColor(imgData, texts) {
  let data = imgData.data;
  let width = imgData.width;
  let height = imgData.height;
  let defaultColor = [0, 0, 0];
  let minVariance = 20;

  return new Promise((resolve, reject) => {
    let isColor = false;
    texts.some(t => {
      let left = Math.floor(t.transform[4]);
      let w = Math.round(t.width);
      let h = Math.round(t.height);
      let bottom = Math.round(height - t.transform[5]);
      let top = bottom - h;
      let start = (left + top * width) * 4;
      let color = [];
      let best = Infinity;
      let stats = new ImageStats();

      for (let i, v, row = 0; row < h; row++) {
        i = start + row * width * 4;
        for (let col = 0; col < w; col++) {
          if ((v = data[i] + data[i + 1] + data[i + 2]) < best) {
            best = v;
            color[0] = data[i];
            color[1] = data[i + 1];
            color[2] = data[i + 2];
          }
          stats.addPixel(data[i], data[i + 1], data[i + 2]);
          i += 4;
        }
      }
      let stdDev = stats.getStdDev();
      t.color = stdDev < minVariance ? defaultColor : color;

      if (t.color[0] !== t.color[1] || t.color[0] !== t.color[2])
        isColor = true;
      return isColor;
    });
    resolve(isColor);
  });
}
async function initializePDFs(pdf) {
  return {
    masterPDF: pdf,
    bwPDF: await PDFDocument.create(),
    colorPDF: await PDFDocument.create()
  };
}

async function parsePDFColors(pdfData) {
  let pdf = await getDocument(pdfData);

  let bwPages = [];
  let colorPages = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    let pdfPage = await pdf.getPage(i);
    let isColor = await checkPDFPageColor(pdfPage);

    if (isColor && colorPages.indexOf(pdfPage.pageIndex) === -1)
      colorPages.push(pdfPage.pageIndex);
    else if (bwPages.indexOf(pdfPage.pageIndex) === -1)
      bwPages.push(pdfPage.pageIndex);
  }

  return { bwPages, colorPages };
}

function copyPDFPages(sourcePDF, destPDF, pages) {
  return new Promise((resolve, reject) => {
    destPDF.copyPages(sourcePDF, pages).then(newPages => {
      for (let i = 0; i < pages.length; i++) {
        destPDF.addPage(newPages[i]);
      }
      resolve(destPDF);
    });
  });
}

async function splitPDF(data, bwPages, colorPages) {
  const pdf = await PDFDocument.load(data);
  let { masterPDF, colorPDF, bwPDF } = await initializePDFs(pdf);
  const pdfs = await Promise.all([
    copyPDFPages(masterPDF, bwPDF, bwPages),
    copyPDFPages(masterPDF, colorPDF, colorPages)
  ]);
  return { bwPDF: pdfs[0], colorPDF: pdfs[1] };
}

function zipPDF(bwPDF, colorPDF) {
  return Promise.all([
    bwPDF.data.saveAsBase64(),
    colorPDF.data.saveAsBase64()
  ]).then(saveData => {
    let zip = new JSZip();
    zip.file(bwPDF.name, saveData[0], { base64: true });
    zip.file(colorPDF.name, saveData[1], { base64: true });
    return zip.generateAsync({ type: "blob" });
  });
}

export {
  checkPDFPageColor,
  checkCanvasColor,
  checkTextColor,
  zipPDF,
  parsePDFColors,
  splitPDF
};
