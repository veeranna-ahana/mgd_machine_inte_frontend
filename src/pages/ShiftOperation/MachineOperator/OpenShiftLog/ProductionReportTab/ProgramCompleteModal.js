import React from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { baseURL } from "../../../../../api/baseUrl";

export default function ProgramCompleteModal({
  setProgramComplete,
  programComplete,
  selectProductionReport,
  getMachineTaskData,
  setOpenTable,
  getMachinetaskdata,
  setSelectProductionReport,
}) {
  // console.log("selectProductionReport",selectProductionReport);
  const handleClose = () => {
    setProgramComplete(false);
  };

  const onClickYes = () => {
    // Get the first item from getMachinetaskdata array
    const firstItem = getMachinetaskdata[0];

    // Update selectProductionReport state with the first item
    setSelectProductionReport({ ...firstItem, index: 0 });

    // Make the API call
    axios
      .post(baseURL + "/ShiftOperator/programCompleted", {
        selectProductionReport,
      })
      .then((response) => {
        setProgramComplete(false);
        toast.success("Success", {
          position: toast.POSITION.TOP_CENTER,
        });
        setOpenTable(false);
        // Set selectProductionReport state to the first item again
        setSelectProductionReport({ ...firstItem, index: 0 });
        getMachineTaskData();
      });
  };

  return (
    <div>
      <Modal show={programComplete} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontSize:'14px'}}>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{fontSize:'12px'}}>
          Do you want to change status of program to completed ?
        </Modal.Body>

        <Modal.Footer>
          <button className="group-button button-style" onClick={onClickYes}>
            Yes
          </button>
          <button className="group-button button-style" onClick={handleClose}>
            No
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
