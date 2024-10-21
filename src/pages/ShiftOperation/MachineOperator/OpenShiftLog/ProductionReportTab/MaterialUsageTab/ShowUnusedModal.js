import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';

export default function ShowUnusedModal({setShowUnused,showUnused, filterUnusedData }) {
    const handleClose=()=>{
       setShowUnused(false);
            }

            const handleOkClick = () => {
              // Call the filterUnusedData callback to filter the data
              filterUnusedData();
              setShowUnused(false);
          }
  return (
    <div>
       <Modal show={showUnused} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>Used
         </Modal.Body> 

        <Modal.Footer>
           <Button variant="primary" onClick={handleOkClick}>
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
