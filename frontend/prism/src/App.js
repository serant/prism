import React, { Component } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "./App.css";

import NavBar from "./components/navBar";
import PDFUpload from "./components/pdfUpload";
import { splitPDF, parsePDFColors, zipPDF } from "./tools/pdfParser";
import { saveAs } from "file-saver";

// Next steps
// Deploy webiste
// Put logo in nav bar
// Connect to CDN
// Enable multiple threads for parsing

class App extends Component {
  state = {
    collate: false,
    parsing: false
  };

  handleDrop = droppedPdf => {
    console.log(droppedPdf);
    let fileReader = new FileReader();
    fileReader.onload = async () => {
      let state = this.state;
      state.parsing = true;
      this.setState(state);
      const data = new Uint8Array(fileReader.result);

      let { bwPages, colorPages } = await parsePDFColors(data);

      const { collate } = this.state;
      if (collate) {
        bwPages = bwPages.sort((a, b) => {
          return a - b;
        });
        colorPages = colorPages.sort((a, b) => {
          return a - b;
        });
      }
      const { bwPDF, colorPDF } = await splitPDF(data, bwPages, colorPages);

      const fileBase = droppedPdf.name.split(".pdf")[0];
      const bwName = fileBase + " BW.pdf";
      const colorName = fileBase + " Color.pdf";
      const zipName = fileBase + ".zip";

      const zip = await zipPDF(
        { name: bwName, data: bwPDF },
        { name: colorName, data: colorPDF }
      );
      await saveAs(zip, zipName);
      state.parsing = false;
      this.setState(state);
    };

    fileReader.readAsArrayBuffer(droppedPdf);
  };

  render() {
    return (
      <React.Fragment>
        <NavBar />
        <main className="container">
          <div className="row" style={{ padding: "30px" }}>
            <h2>Split PDF Documents by Color</h2>
            <p>
              Save money when using pay-per-page printers. PrismPDF splits a PDF
              document into its color and black/white counterparts so that you
              only need to send the color pages to a color printer.
            </p>
          </div>
          <div>
            <PDFUpload
              onDrop={document => this.handleDrop(document)}
              parsing={this.state.parsing}
            />
          </div>
          <div className="container" style={{ padding: "50px" }}>
            <div className="row text-center">
              <div className="col-sm">
                <i
                  className="fa fa-2x fa-usd row"
                  style={{ padding: "15px" }}
                />
                <h5>Cut Printing Costs</h5>
                <p>
                  Pay printers charge a premium when printing colored PDFs -
                  even for black/white pages. PrismPDF splits a PDF by page
                  color so that you only need to pay a premium for the color
                  pages. This is perfect if you're in a co-working space,
                  college, or using a printing service.
                </p>
              </div>
              <div className="col-sm">
                <i
                  className="fa fa-2x fa-lock row"
                  style={{ padding: "15px" }}
                />
                <h5>No File Transfer</h5>
                <p>
                  Your PDF documents stay on your computer. We have no access to
                  your files and the conversion is done entirely within your
                  browser.
                </p>
              </div>
              <div className="col-sm">
                <i
                  className="fa fa-2x fa-lightbulb-o row"
                  style={{ padding: "15px" }}
                />
                <h5>Accurate and Intelligent</h5>
                <p>
                  PrismPDF supports collating pages and double sided documents.
                  It can even ignore colored text so that you are paying for
                  color printing on pages with images.
                </p>
              </div>
            </div>
          </div>
        </main>
        <footer className="footer mt-auto py-3">
          <div className="container">
            <span className="text-muted">Copyright 2019 PrismPDF</span>
          </div>
        </footer>
      </React.Fragment>
    );
  }
}

export default App;
