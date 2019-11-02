import React from "react";
import ListGroup from "react-bootstrap/ListGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Switch from "./switch";

const Settings = ({ settings }) => {
  return (
    <ListGroup>
      <ListGroup.Item variant="primary">
        <h5>Settings</h5>
      </ListGroup.Item>
      {settings.map(s => (
        <ListGroup.Item key={`${s["name"]}Switch`}>
          <Row>
            <Col md="auto">
              <Switch
                style={{ padding: "0px" }}
                id={`${s["name"]}Switch`}
                onChange={() => s["onChange"]()}
                label={s["label"]}
              />
            </Col>
            <Col md="auto" style={{ padding: "0px" }}>
              <OverlayTrigger
                style={{ padding: "0px" }}
                key={`${s["name"]}OverlayTrigger`}
                placement="right"
                overlay={
                  <Tooltip key={`${s["name"]}Tooltip`}>
                    {s["description"]}
                  </Tooltip>
                }
              >
                <i
                  style={{ padding: "0px" }}
                  className="fa fa-info-circle"
                  aria-hidden="true"
                />
              </OverlayTrigger>
            </Col>
          </Row>
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default Settings;
