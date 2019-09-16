import ImageStats from "./imageStats";
import { getDocument } from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import asyncPool from "tiny-async-pool";
import { range } from "lodash";

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

async function parsePDFColors(pdfData, onProgress, doubleSided) {
  let pdf = await getDocument(pdfData);

  let bwPages = [];
  let colorPages = [];

  // TODO: double sided mode
  // Basically if the page is odd and colored, then the next page
  // will also need to go in the color pdf

  // First parse all the odd pages
  // If double-sided then rule out all the even pages that are colored
  // Then parse all the even pages that are bw

  const oddPages = range(0, pdf.numPages, 2);
  let evenPages = pdf.numPages === 1 ? [] : range(1, pdf.numPages, 2);

  const parsePage = pageIndex =>
    new Promise(async (resolve, reject) => {
      const pdfPage = await pdf.getPage(pageIndex + 1);
      const isColor = await checkPDFPageColor(pdfPage);

      if (isColor && colorPages.indexOf(pdfPage.pageIndex) === -1)
        colorPages.push(pdfPage.pageIndex);
      else if (bwPages.indexOf(pdfPage.pageIndex) === -1)
        bwPages.push(pdfPage.pageIndex);

      onProgress(bwPages, colorPages, pdf.numPages);
      resolve(isColor);
    });

  await asyncPool(2, oddPages, parsePage);

  // If double sided, we know that the even pages that
  // that are on the backside of a colored odd number page should
  // also be colored
  if (doubleSided)
    colorPages.forEach(page => {
      const i = evenPages.indexOf(page + 1);
      if (i !== -1) colorPages.push(...evenPages.splice(i, 1));
    });

  if (evenPages.length > 0) await asyncPool(2, evenPages, parsePage);

  if (doubleSided)
    colorPages.forEach(page => {
      if (page % 2) return;
      const i = bwPages.indexOf(page - 1);
      if (i !== -1) colorPages.push(...evenPages.splice(i, 1));
    });

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

async function splitPDF(data, documentMap) {
  const masterPDF = await PDFDocument.load(data);

  for (let i = 0; i < documentMap.length; i++) {
    let destPDF = await PDFDocument.create();
    await copyPDFPages(masterPDF, destPDF, documentMap[i]["pages"]);
    documentMap[i]["data"] = destPDF;
  }

  return documentMap;
}

async function zipPDFs(pdfs, collate) {
  let zip = new JSZip();

  for (let i = 0; i < pdfs.length; i++) {
    let folderName = collate
      ? pdfs[i]["name"].indexOf(" Color.pdf") === -1
        ? "BW"
        : "Color"
      : ".";

    const save = await pdfs[i]["data"].saveAsBase64();
    zip.file(`${folderName}/${pdfs[i]["name"]}`, save, { base64: true });
  }

  return zip.generateAsync({ type: "blob" });
}

export {
  checkPDFPageColor,
  checkCanvasColor,
  checkTextColor,
  zipPDFs,
  parsePDFColors,
  splitPDF
};
