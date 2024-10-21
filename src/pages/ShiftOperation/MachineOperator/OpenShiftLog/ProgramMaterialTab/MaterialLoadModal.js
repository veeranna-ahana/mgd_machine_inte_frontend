import React from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import { useGlobalContext } from "../../../../../Context/Context";

export default function MaterialLoadModal({
  loadProgram,
  setLoadProgram,
  selectedMtrlTable,
  onclickofYes,
}) {

  const handleClose = () => {
    setLoadProgram(false);
  };

  const handleYesClick = () => {
    onclickofYes();
    setLoadProgram(false);
  };
  return (
    <div>
      <Modal show={loadProgram} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Do You wish to Load Material ID:
          <strong>{selectedMtrlTable?.ShapeMtrlID}</strong>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={handleYesClick}>
            Yes
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
