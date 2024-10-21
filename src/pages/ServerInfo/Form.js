import React from 'react'
import { Button, Modal } from 'react-bootstrap'

export default function Form() {
  return (
    <div>
      <Modal>
        <Modal.Header closeButton>
          <Modal.Title>Magod Unit Accounts</Modal.Title>
        </Modal.Header>
        <Modal.Body>   
            <p>Confirm : Do you wish to Post the voucher</p>
        </Modal.Body>
        <Modal.Footer>
        <Button variant="primary" type='submit' >
            Yes
          </Button>
          <Button variant="secondary">
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
