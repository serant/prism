import React, { Component } from "react";
import NavBar from "./components/navbar";
import UploadPane from "./components/uploadpane";
import DownloadPane from "./components/downloadpane";
import Footer from "./components/footer";
import axios from "axios";
import "./App.css";

class App extends Component {
  state = {
    acceptedFiles: null,
    conversion: { pdfs: [] }
  };

  postConversion = file => {
    const url = "http://localhost:3001/api/conversions/";
    const data = new FormData();
    data.append("conversionPdf", file);
    axios({
      url: url,
      data: data,
      method: "post"
    }).then(r => {
      const conversion = this.state.conversion;
      conversion.pdfs[0] = {
        fileName: "test.pdf",
        downloadLink: "https://google.com"
      };
      this.setState({ conversion });
    });
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    this.setState({ acceptedFiles });
    this.postConversion(acceptedFiles[0]);
  };

  render() {
    return (
      <React.Fragment>
        <NavBar />
        <main className="container">
          <div className="row">
            <UploadPane onDrop={this.onDrop} />
            <DownloadPane pdfs={this.state.conversion.pdfs} />
          </div>
        </main>
        <Footer />
      </React.Fragment>
    );
  }
}

export default App;
