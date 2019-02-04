import React, { Component } from "react";
class PageNumberDisplay extends Component {
  render() {
    return (
      <div>The pages need to be divided at {this.props.pageNumberArray}</div>
    );
  }
}

export default PageNumberDisplay;
