import React, { Component } from "react";
class NavBar extends Component {
  render() {
    return (
      <nav className="navbar navbar-light bg-light">
        <img
          src={require("../assets/prismLogo.png")}
          height="100px"
          width="500px"
          style={{ paddingTop: "15px" }}
        />
      </nav>
    );
  }
}

export default NavBar;
