import React from 'react';
import Modal from 'react-bootstrap/Modal';
import { Button } from 'react-bootstrap';

export default function MainModal({setOpenModal,openModal}) {
    
    const handleClose=()=>{
        setOpenModal(false);
    }
  return (
    <div>
      <Modal show={openModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontSize:'14px'}}>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{fontSize:'12px'}}>Is Program 415706 running from the begining of this shift? 
         </Modal.Body> 

        <Modal.Footer>
          <button className='button-style group-button'
        >
            Yes
          </button>
          <button className='button-style group-button' onClick={handleClose}>
            No
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
