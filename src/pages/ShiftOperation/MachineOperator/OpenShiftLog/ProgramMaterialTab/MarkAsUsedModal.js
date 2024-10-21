import React from 'react'
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';

export default function MarkAsUsedModal({ MarkasUsed, setMarkasUsed, handleMarkasUsed }) {

  const handleClose = () => {
    setMarkasUsed(false);
  }

  const handleYesClick = () => {
    handleMarkasUsed();
    setMarkasUsed(false);
  }

  return (
    <div>
      <Modal show={MarkasUsed} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>Material once Marked as Used cannot be used again.
          Are you sure?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleYesClick}
          >
            Yes
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
