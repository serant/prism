import React, { Component } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "./App.css";

import NavBar from "./components/navBar";
import PDFUpload from "./components/pdfUpload";
import { checkPDFPageColor } from "./tools/pdfParser";
import { getDocument } from "pdfjs-dist";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
let JSZip = require("jszip");

// Next steps
// Draw out UI
// Create options pane
// * collate
// * double sided
// Create collate mode
// Create progress bar
// Create double sided mode

class App extends Component {
  state = {
    collate: false,
    masterPDF: null,
    bwPDF: null,
    colorPDF: null,
    colorPages: [],
    bwPages: [],
    numPages: null
  };

  initializePDFs = pdf => {
    let state = this.state;
    state.masterPDF = pdf;
    return new Promise((resolve, reject) => {
      let createPromises = [];

      createPromises.push(
        PDFDocument.create().then(pdfDoc => {
          state.bwPDF = pdfDoc;
        })
      );

      createPromises.push(
        PDFDocument.create().then(pdfDoc => {
          state.colorPDF = pdfDoc;
        })
      );

      Promise.all(createPromises).then(() => {
        this.setState(state);
        resolve(state);
      });
    });
  };

  addColorPage = page => {
    let state = this.state;
    if (state.colorPages.indexOf(page.pageIndex) !== -1) return;

    state.colorPages.push(page.pageIndex);
    this.setState(state);
  };

  addBWPage = page => {
    let state = this.state;
    if (state.bwPages.indexOf(page.pageIndex) !== -1) return;

    state.bwPages.push(page.pageIndex);
    this.setState(state);
  };

  parsePdfPage = pdfPage => {
    return new Promise((resolve, reject) => {
      checkPDFPageColor(pdfPage)
        .then(isColor => {
          isColor ? this.addColorPage(pdfPage) : this.addBWPage(pdfPage);
          resolve(isColor);
        })
        .catch(err => {
          reject(err);
        });
    });
  };

  handleDownloadReady = () => {
    return;
  };

  handleDrop = droppedPdf => {
    let fileReader = new FileReader();

    fileReader.onload = () => {
      const data = new Uint8Array(fileReader.result);

      PDFDocument.load(data)
        .then(pdf => this.initializePDFs(pdf))
        .then(() => getDocument(data).promise)
        .then(pdf => {
          return new Promise((resolve, reject) => {
            let pagePromises = [];

            for (let i = 1; i <= pdf.numPages; i++) {
              pagePromises.push(
                new Promise((resolve, reject) => {
                  pdf
                    .getPage(i)
                    .then(pdfPage => this.parsePdfPage(pdfPage))
                    .then(() => resolve())
                    .catch(err => reject(err));
                })
              );
            }

            Promise.all(pagePromises).then(() => {
              this.handleDownloadReady();
              console.log("Prepare for Download", pagePromises);
              resolve();
            });
          });
        })
        .then(() => {
          return new Promise(resolve => {
            // Now we need to update the color and bw pdf documents
            let {
              masterPDF,
              colorPDF,
              bwPDF,
              colorPages,
              bwPages,
              collate
            } = this.state;

            if (collate) {
              bwPages = bwPages.sort((a, b) => {
                return a - b;
              });
              colorPages = colorPages.sort((a, b) => {
                return a - b;
              });
            }
            // TODO collate needs to go here

            let pagePromises = [];
            pagePromises.push(
              new Promise((docResolve, docReject) => {
                bwPDF.copyPages(masterPDF, bwPages).then(newBwPages => {
                  for (let i = 0; i < newBwPages.length; i++) {
                    bwPDF.addPage(newBwPages[i]);
                  }
                  let state = this.state;

                  state.bwPDF = bwPDF;
                  this.setState(bwPDF);
                  docResolve();
                });
              })
            );

            pagePromises.push(
              new Promise((docResolve, docReject) => {
                colorPDF
                  .copyPages(masterPDF, colorPages)
                  .then(newColorPages => {
                    for (let i = 0; i < newColorPages.length; i++) {
                      colorPDF.addPage(newColorPages[i]);
                    }
                    let state = this.state;

                    state.colorPDF = colorPDF;
                    this.setState(colorPDF);
                    docResolve();
                  });
              })
            );

            Promise.all(pagePromises).then(() => {
              console.log("Downloads ready");
              resolve();
            });
          });
        })
        // Now save to browser
        .then(() => {
          let { bwPDF, colorPDF } = this.state;
          let returnData = {};
          let savePromises = [];
          return new Promise((resolve, reject) => {
            savePromises.push(
              bwPDF.saveAsBase64().then(data => (returnData.bwData = data))
            );
            savePromises.push(
              colorPDF
                .saveAsBase64()
                .then(data => (returnData.colorData = data))
            );

            Promise.all(savePromises).then(() => {
              resolve(returnData);
            });
          });
        })
        // Start download
        .then(data => {
          let zip = new JSZip();
          zip.file("bwPdf.pdf", data.bwData, { base64: true });
          zip.file("colorPdf.pdf", data.colorData, { base64: true });
          return zip.generateAsync({ type: "blob" });
        })
        .then(content => {
          saveAs(content, "download.zip");
        });
    };

    fileReader.readAsArrayBuffer(droppedPdf);
  };

  render() {
    return (
      <React.Fragment>
        <NavBar />
        <main className="container">
          <div style={{ margin: "100px 0 0 0 " }}>
            <PDFUpload onDrop={document => this.handleDrop(document)} />
            <div />
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
