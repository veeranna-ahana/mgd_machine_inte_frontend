import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import PrintSelectedPdf from './PrintSelectedPdf';

export default function PrintSelectedModal({openPrintSelect,onClose,currentObjectNew}) {
  const [fullscreen, setFullscreen] = useState(true);

  return (
    <>
      <Modal show={openPrintSelect} fullscreen={fullscreen} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <PrintSelectedPdf selectRow={currentObjectNew}/>
        </Modal.Body>
      </Modal>
    </>
  );
}
