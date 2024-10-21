import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function GlobalModal({
  show,
  title,
  content,
  onYesClick,
  onNoClick,
  onClose,
}) {
  return (
    <div>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontSize:'14px'}}>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontSize:'12px'}}>{content}</Modal.Body>
        <Modal.Footer>
          <button className="group-button button-style" onClick={onYesClick}>
            Yes
          </button>
          <button className="group-button button-style" onClick={onNoClick}>
            No
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
