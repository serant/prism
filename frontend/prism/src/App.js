import React, { Component } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "./App.css";

import NavBar from "./components/navBar";
import PDFUpload from "./components/pdfUpload";
import PDFViewer from "./components/pdfViewer";
import { checkPDFPageColor } from "./tools/pdfParser";

const options = {
  cMapUrl: "cmaps/",
  cMapPacked: true
};

class App extends Component {
  state = {
    bwPDF: null,
    colorPDF: null,
    colorPages: [],
    bwPages: [],
    numPages: null
  };

  onDocumentLoadSuccess = pdf => {
    this.setState({ numPages: pdf.numPages });
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

  onPageLoad = pdfPage => {
    checkPDFPageColor(pdfPage).then(isColor =>
      isColor ? this.addColorPage(pdfPage) : this.addBWPage(pdfPage)
    );
  };

  handleDrop = pdf => {
    this.setState({ bwPDF: pdf });
  };

  render() {
    const { bwPDF, colorPDF, numPages } = this.state;

    return (
      <React.Fragment>
        <NavBar />
        <main className="container">
          <div style={{ margin: "100px 0 0 0 " }}>
            <PDFUpload onDrop={bwPDF => this.handleDrop(bwPDF)} />
            <div />
            <div className="container" style={{ margin: "20px" }}>
              <div className="row">
                <div className="col-sm">
                  <PDFViewer
                    className="col-sm"
                    title="Black and White Pages"
                    file={bwPDF}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                    onPageLoad={this.onPageLoad}
                    options={options}
                    numPages={numPages}
                  />
                </div>
                <div className="col-sm">
                  <PDFViewer
                    className="col-sm"
                    title="Colored Pages"
                    file={colorPDF}
                    onLoadSuccess={this.onDocumentLoadSuccess}
                    onPageLoad={this.onPageLoad}
                    options={options}
                    numPages={numPages}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </React.Fragment>
    );
  }
}

export default App;
