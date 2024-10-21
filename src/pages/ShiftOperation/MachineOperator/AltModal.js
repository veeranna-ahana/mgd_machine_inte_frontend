import React from "react";
import { Modal, Button } from 'react-bootstrap';

export default function AltModal({
  show,
  data, 
  onYesClick,
  onNoClick,
  onClose,
})

{
  const handleYesClick = () => {
    onYesClick(); // Call the provided onYesClick function
  }

  return (
    <div>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontSize:'14px'}}>{data.title}</Modal.Title> 
        </Modal.Header>
        <Modal.Body style={{fontSize:'12px'}}>{data.content}</Modal.Body> 
        <Modal.Footer>
          <button className='button-style group-button' onClick={handleYesClick}>
            Ok
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
