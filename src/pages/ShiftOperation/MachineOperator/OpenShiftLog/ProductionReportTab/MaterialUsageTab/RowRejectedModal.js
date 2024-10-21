import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';

export default function RowRejectedModal({setRowsRejected,rowsRejected}) {
    const handleClose=()=>{
        
            }
  return (
    <div>
      <Modal show={rowsRejected} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>Parts Quantity Mismatch
         </Modal.Body> 

        <Modal.Footer>
          <Button variant="primary" 
        >
           Ok
          </Button>
          {/* <Button variant="secondary" onClick={handleClose}>
            No
          </Button> */}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
