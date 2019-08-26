import React, { Component } from "react";
class NavBar extends Component {
  render() {
    return (
      <nav className="navbar navbar-light bg-light">
        <a href="#" className="navbar-brand">
          <img
            src={"../assets/logo.jpg"}
            alt=""
            width="133"
            height="30"
            className="d-inline-block align-top"
          />
        </a>
      </nav>
    );
  }
}

export default NavBar;
