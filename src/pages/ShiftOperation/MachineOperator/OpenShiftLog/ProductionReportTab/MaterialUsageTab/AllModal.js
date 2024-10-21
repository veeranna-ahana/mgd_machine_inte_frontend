import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';

export default function AllModal({allModal,setAllModal, resetData}) {
    const handleClose=()=>{
        setAllModal(false);
            }
            const handleOkClick = () => {
              resetData();
              setAllModal(false);
          }
          
  return (
    <div>
        <Modal show={allModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>
            All
         </Modal.Body> 

        <Modal.Footer>
          <Button variant="primary" onClick={handleOkClick}
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
