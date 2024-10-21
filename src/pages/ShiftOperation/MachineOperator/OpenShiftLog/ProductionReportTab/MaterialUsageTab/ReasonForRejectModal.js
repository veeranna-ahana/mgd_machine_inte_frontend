import React from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";

export default function ReasonForRejectModal({
  setReasonForReject,
  reasonForReject,
}) {
  const handleClose = () => {
    setReasonForReject(false);
  };

  return (
    <div>
      <Modal show={reasonForReject} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>Give Reason For Rejection: 23/04/23</Modal.Body>

        <Modal.Footer>
          <Button variant="primary">Ok</Button>
          {/* <Button variant="secondary" onClick={handleClose}>
            No
          </Button> */}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
