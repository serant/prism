import React, { Component } from "react";
class NavBar extends Component {
  render() {
    return (
      <nav className="navbar navbar-light bg-light">
        <span className="navbar-brand mb-0 h1">
          Prism
          <img src={require("./Prismlogo.png")} height="60" width="200" />
        </span>
      </nav>
    );
  }
}

export default NavBar;
