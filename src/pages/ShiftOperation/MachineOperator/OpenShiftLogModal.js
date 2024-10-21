import axios from "axios";
import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../../../api/baseUrl";
import { useGlobalContext } from "../../../Context/Context";

export default function OpenShiftModal({
  openmodal,
  setOpenmodal,
  selectedMachine,
  finalDay1,
  selectshifttable,
  Shift,
  date,
  requiredProgram,numberOfProperties
}) {
  const data = {
    selectedMachine: selectedMachine,
    finalDay1: finalDay1,
    selectshifttable: selectshifttable,
    Shift: Shift,
    date: date,
  };
  const { setShiftLogDetails, setMachinetaskdata } = useGlobalContext();


  //Machine Task Table
  let Machine = selectshifttable?.Machine;
  const getMachineTaskDataFunc = () => {
    // console.log("func called");
    axios
      .post(baseURL + "/ShiftOperator/MachineTasksData", {
        MachineName: Machine,
      })
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].Qty === 0) {
            response.data[i].rowColor = "#DC143C";
          } else if (response.data[i].QtyAllotted === 0) {
            response.data[i].rowColor = "#E0FFFF";
          } else if (response.data[i].QtyCut === 0) {
            response.data[i].rowColor = "#778899";
          } else if (response.data[i].QtyCut === response.data[i].Qty) {
            response.data[i].rowColor = "#008000";
          } else if (response.data[i].QtyCut === response.data[i].QtyAllotted) {
            response.data[i].rowColor = "#ADFF2F";
          } else if (response.data[i].Remarks !== null) {
            response.data[i].rowColor = "#DC143C";
          }
        }
        setMachinetaskdata(response.data);
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
  };

  useEffect(()=>{
    getMachineTaskDataFunc();
  },[])


  const navigate = useNavigate();

  //Onclick of Yes in OpenShiftLog Modal
  const openShiftPage = () => {
    if (isNaN(requiredProgram[0].NCProgarmNo)) {
      navigate("OpenShiftLog", { state: { data } });
      axios
        .post(baseURL + "/ShiftOperator/onClickYesStoppage", {
          requiredProgram,
          selectshifttable,
        })
        .then((response) => {
        })
        .catch((error) => {
          console.log(error)
        });
    } else {
      // console.log("excuted No Query")
      navigate("OpenShiftLog", { state: { data } });
      axios
        .post(baseURL + "/ShiftOperator/onClickYes", {
          requiredProgram,
          selectshifttable,
        })
        .then((response) => {
        })
        .catch((error) => {
        });
    }
    getMachineTaskDataFunc();
  };


  //Onclcik of No in OpenShiftLog Modal
  const handleClose = () => {
    if (isNaN(requiredProgram[0].NCProgarmNo)) {
      navigate("OpenShiftLog", { state: { data } });
      axios
        .post(baseURL + "/ShiftOperator/onClickNoStoppage", {
          requiredProgram,
          selectshifttable,
        })
        .then((response) => {});
      setOpenmodal(false);
    } else {
      navigate("OpenShiftLog", { state: { data } });
      axios
        .post(baseURL + "/ShiftOperator/onClickNo", {
          requiredProgram,
          selectshifttable,
        })
        .then((response) => {});
      setOpenmodal(false);
    }
  };


  //get ShiftLog Data
  const getShiftLogData = () => {
    axios
      .post(baseURL + "/ShiftOperator/getShiftLog", {
        selectshifttable: selectshifttable,
      })
      .then((response) => {
        const updatedData = response.data.map((item) => {
          let dateSplit = item.FromTime.split(" ");
          let date = dateSplit[0].split("-");
          let year = date[0];
          let month = date[1];
          let day = date[2];
          let finalDay = `${day}/${month}/${year} ${dateSplit[1]}`;
          item.FromTime = finalDay;

          let dateSplit1 = item.ToTime.split(" ");
          let date1 = dateSplit1[0].split("-");
          let year1 = date1[0];
          let month1 = date1[1];
          let day1 = date1[2];
          let finalDay1 = `${day1}/${month1}/${year1} ${dateSplit1[1]}`;
          item.ToTime = finalDay1;

          if (item.Locked === 1) {
            item.rowColor = "#87CEEB";
          } else {
          }
          return item;
        });

        setShiftLogDetails(updatedData);
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
  };

  useEffect(() => {
    getShiftLogData();
  }, []);


  const handleCloseOk = () => {
    setOpenmodal(false);
  };


  return (
    <div>
      <Modal show={openmodal} onHide={handleCloseOk}>
        <Modal.Header closeButton>
          <Modal.Title style={{fontSize:'14px'}}>Magod Machine</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{fontSize:'12px'}}>
          {numberOfProperties === 0 ? (
            "No present shift assigned for this machine."
          ) : (
            <>
              {"Is "} {"Program"}{" "}
              <strong>{requiredProgram[0]?.NCProgarmNo}</strong>
              {" running from the beginning of this shift?"}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          {numberOfProperties === 0 ? (
            <button className="button-style group-button" onClick={handleCloseOk}>
              OK
            </button>
          ) : (
            <>
              <button
                className="button-style group-button"
                onClick={openShiftPage}
              >
                Yes
              </button>
              <button className="button-style group-button" onClick={handleClose}>
                No
              </button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
