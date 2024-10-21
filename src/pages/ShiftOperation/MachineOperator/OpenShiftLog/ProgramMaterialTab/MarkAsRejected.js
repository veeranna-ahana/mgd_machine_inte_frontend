import React from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";

export default function MarkAsRejected({
  MarkasReject,
  setMarkasReject,
  handleMarkasRejected,
}) {
  const handleClose = () => {
    setMarkasReject(false);
  };

  const handleYesClick = () => {
    handleMarkasRejected();
    setMarkasReject(false);
  };

  return (
    <div>
      <Modal show={MarkasReject} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Material once Marked as Rejected cannot be used again. Are you sure?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleYesClick}>
            Yes
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
