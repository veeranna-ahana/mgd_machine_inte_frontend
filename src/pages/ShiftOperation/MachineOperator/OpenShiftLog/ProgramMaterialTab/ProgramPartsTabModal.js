import React from "react";
import { Modal, Button } from "react-bootstrap";
import ProgramPartsForm from "../ProgramPartsTab/ProgramPartsForm";
import { useGlobalContext } from "../../../../../Context/Context";

export default function ProgramPartsTabModal() {
    const {tubeCuttingModal,setTubeCuttingModal } = useGlobalContext();

  return (
    <div>
      <Modal show={tubeCuttingModal} onHide={(e)=>setTubeCuttingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "18px" }}>Tube Cutting Operation</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ fontSize: "12px" }}>
            <ProgramPartsForm/>
        </Modal.Body>
      </Modal>
    </div>
  );
}
