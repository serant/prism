import React, { Component } from "react";
import { Helmet } from "react-helmet";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "./App.css";
import FeatureSet from "./components/feature";

import NavBar from "./components/navBar";
import Converter from "./components/converter";

import ReactGA from "react-ga";

class App extends Component {
  render() {
    ReactGA.initialize("UA-150776089-1");
    ReactGA.pageview(window.location.pathname + window.location.search);
    return (
      <React.Fragment>
        <Helmet>
          <meta charSet="utf-8" />
          <meta
            name="description"
            content="Split PDF documents into their colored and black/white counterparts. Save money when using commerical printing services!"
          />
          <meta name="author" content="PrismPDF" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>PrismPDF</title>
          <link rel="canonical" href="https://prismpdf.com" />
        </Helmet>

        <NavBar />
        <main className="container">
          <div className="row" style={{ padding: "30px" }}>
            <h2 className="sub-heading">Split PDF Documents by Color</h2>
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
