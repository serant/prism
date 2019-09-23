import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import Switch from "./switch";

const Settings = ({ settings }) => {
  return (
    <ListGroup>
      <ListGroup.Item variant="primary">
        <h5>Settings</h5>
      </ListGroup.Item>
      {settings.map(s => (
        <ListGroup.Item key={`${s["name"]}Switch`}>
          <Switch
            id={`${s["name"]}Switch`}
            onChange={() => s["onChange"]()}
            label={s["label"]}
          />
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default Settings;
