import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import NavBar from "./components/navBar";
import FilesDrop from "./components/filesDropZone";

class App extends Component {
  render() {
    return (
      <React.Fragment>
        <NavBar />
        <FilesDrop />
      </React.Fragment>
    );
  }
}

export default App;
