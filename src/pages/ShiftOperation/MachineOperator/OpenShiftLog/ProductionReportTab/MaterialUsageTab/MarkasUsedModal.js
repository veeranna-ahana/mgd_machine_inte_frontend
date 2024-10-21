import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import ReasonForRejectModal from "./ReasonForRejectModal";
import axios from "axios";
import { baseURL } from "../../../../../../api/baseUrl";
import { toast } from "react-toastify";

export default function MarkasUsedModal({
  setMarkasUsed,
  markasUsed,
  handleMarkasUsed,
  selectProductionReportData,
  setProductionReportData,setSelectdefaultRow,setComplete,selectProductionReport
}) {
  const [reasonForReject, setReasonForReject] = useState(false);

  const handleClose = () => {
    setMarkasUsed(false);
  };

  const reasonSubmit = () => {
    setMarkasUsed(false);
    handleMarkasUsed();
    axios
      .post(baseURL + "/ShiftOperator/MachineTasksProfile", {
        NCId: selectProductionReportData,
      })
      .then((response) => {
        // toast.success("success", {
        //   position: toast.POSITION.TOP_CENTER,
        // });
        setSelectdefaultRow([])
        setProductionReportData(response.data);
        const data = response.data;
      let count = 0;
  
      // Iterate through each object in the response data
      data.forEach((item) => {
        // Check if Used or Rejected is zero
        if (item.Used === 1 || item.Rejected === 1) {
          count++;
        }
      });
  
      // Output the count
      
      // console.log("Number of objects with Used or Rejected as zero:", count);
      // console.log("selectProductionReport.Qty",selectProductionReport.Qty);
  
      // If count equals selectProductionReport.Qty, setComplete(true)
      if (count === selectProductionReport.Qty) {
        console.log("conditon 1")
        setComplete(true);
      }else{
        console.log("conditon 2")
        setComplete(false);
      }
  
      // If count is greater than 0, another row is incremented
      if (count > 0) {
        // Increment another row
      }
      });
  };
  return (
    <div>
      <Modal show={markasUsed} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Material once Marked as Used cannot be used again. Are you sure?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" onClick={reasonSubmit}>
            Yes
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            No
          </Button>
        </Modal.Footer>
      </Modal>

      <ReasonForRejectModal
        reasonForReject={reasonForReject}
        setReasonForReject={setReasonForReject}
      />
    </div>
  );
}
