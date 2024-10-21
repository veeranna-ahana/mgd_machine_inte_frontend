import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";

export default function RejectModal({
  rowsRejected,
  setRowsRejected,
  handleRejectedRow,setSelectdefaultRow,setRejectReason
}) {
  const handleClose = () => {
    setRowsRejected(false);
  };

  const reasonSubmit = () => {
    setRowsRejected(false);
    handleRejectedRow();
    setSelectdefaultRow([]);
    setRejectReason({})
  };
  return (
    <div>
      <Modal show={rowsRejected} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Material once Marked as Rejected cannot be used again. Are you sure?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={reasonSubmit}>
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
