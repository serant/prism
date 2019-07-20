import React, { Component } from "react";
import PDFDropZone from "./componenets/pdfDropZone";
import PDFViewer from "./componenets/pdfViewer";
import NavBar from "./componenets/navBar";
import { getDocument } from "pdfjs-dist";

import "./App.css";

class App extends Component {
  state = {
    pdf: null
  };

  handleDrop = acceptedFiles => {
    this.setState({
      pdf: acceptedFiles[0]
    });
    const reader = new FileReader();

    const file = acceptedFiles[0];
    console.log(file);

    reader.onloadend = e => {
      // const res/
      // const res = new Uint8Array(e.target.result);
      // console.log(res);
      // this.setState({ pdf: res });
    };
    console.log(file.path);
    this.setState({ pdf: file });
    // reader.readAsArrayBuffer(file);
  };

  handleDownload = () => {
    console.log("Download Clicked");
  };

  render() {
    return (
      <React.Fragment>
        <NavBar />
        <main className="container">
          <PDFDropZone onDrop={this.handleDrop} />
          <PDFViewer pdf={this.state.pdf} />
        </main>
      </React.Fragment>
    );
  }
}

export default App;
