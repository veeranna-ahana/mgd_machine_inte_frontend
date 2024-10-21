
import React from 'react';
import { Button } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { useNavigate} from 'react-router-dom'

export default function ValidationAlertModal({openalert,setOpenAlert}) {
  
    const handleClose=()=>{
        setOpenAlert(true);
    }

  return (
    <div>
         <Modal show={openalert} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontSize:'14px'}}>Magod Machine</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{fontSize:'12px'}}>Error No, Error Description  are mandatory fields
        </Modal.Body> 

        <Modal.Footer>
          <button className='button-style group-button' onClick={handleClose} >
            OK
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
