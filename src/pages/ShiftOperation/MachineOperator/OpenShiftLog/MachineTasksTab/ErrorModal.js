import React from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";

export default function ErrorModal({ ErrorshowModal, setErrorshowModal }) {
  const handleClose = () => {
    setErrorshowModal(false);
  };

  const handleOkClick = () => {
    setErrorshowModal(false);
  };
  return (
    <div>
      <Modal show={ErrorshowModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontSize:'14px'}}>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{fontSize:'12px'}}>
          Cannot Load Program once alloted material is used or rejected : No
          Material to Process
        </Modal.Body>

        <Modal.Footer>
          <button className="group-button button-style" onClick={handleOkClick}>
            Ok
          </button>
          {/* <Button variant="secondary" onClick={handleClose}>
        No
      </Button> */}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
