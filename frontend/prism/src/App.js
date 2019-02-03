import React, { Component } from "react";
//import logo from "./logo.svg";
import "./App.css";
import NavBar from "./components/navBar";
import FilesDrop from "./components/filesDropZone";
import PageNumberDisplay from "./components/pageNumber";
import axios from "axios";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageNumberArray: []
    };
  }

  onDrop = (acceptedFiles, rejectedFiles) => {
    //console.log(acceptedFiles);
    const url =
      "http://tf-ecs-chat-1180599487.us-east-1.elb.amazonaws.com/api/conversions/";
    const data = new FormData();
    data.append("conversionPdf", acceptedFiles[0]);
    axios({
      url: url,
      data: data,
      method: "post"
    }).then(r => {
      this.setState({
        pageNumberArray: r["data"]["createdConversion"]["content"].map(
          x => x["pageNumber"]
        )
      });
      console.log(this.state["pageNumberArray"]);
    });
  };

  render() {
    return (
      <React.Fragment>
        <FilesDrop onDrop={this.onDrop} />
        <PageNumberDisplay {...this.state} />
      </React.Fragment>
    );
  }
}

export default App;
