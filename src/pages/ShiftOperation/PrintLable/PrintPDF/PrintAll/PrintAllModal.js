import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import PrintAllPdf from './PrintAllPdf';

export default function PrintAllModal({onClickyes,setOnclickofYes,currentObject,onClose}) {
  const [fullscreen, setFullscreen] = useState(true);

  return (
    <>
      <Modal show={onClickyes} fullscreen={fullscreen} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <PrintAllPdf currentObject={currentObject}/>
        </Modal.Body>
      </Modal>
    </>
  );
}
