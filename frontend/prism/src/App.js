import React, { Component } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "./App.css";
import FeatureSet from "./components/common/feature";

import NavBar from "./components/navBar";
import Converter from "./components/converter";

class App extends Component {
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
            <Converter />
          </div>
          <div className="container" style={{ padding: "50px" }}>
            <FeatureSet />
          </div>
        </main>
        <footer className="footer mt-auto py-3">
          <div className="container">
            <p>
              <sup>*</sup>Savings based on 40¢ per page for color printing and
              10¢ per page for black/white printing.
            </p>
            <span className="text-muted">Copyright 2019 PrismPDF</span>
          </div>
        </footer>
      </React.Fragment>
    );
  }
}

export default App;
