import React, { useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Button } from "react-bootstrap";
import axios from "axios";
import { baseURL } from "../../../../api/baseUrl";
import { useState } from "react";
import { useGlobalContext } from "../../../../Context/Context";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function StoppageAskModal({
  setAlreadyLoad,
  alreadyLoad,
  selectedStoppageID,
  selectshifttable,
  selectedStoppage,
  setShowTable,
  showTable,
  setInputVisible,
  isInputVisible,
  getMachineShiftStatusForm,
  disableTaskNo,
  getmiddleTbaleData,
}) {
  const { selectedProgram, setShiftLogDetails, shiftLogDetails, setFormData } =
    useGlobalContext();

  const handleClose = () => {
    setAlreadyLoad(false);
  };

  // console.log(disableTaskNo,"disableTaskNo");

  //handle change
  const [firstTaskNo, setFirstTaskNo] = useState("");
  const firstInputField = (e) => {
    setFirstTaskNo(e.target.value);
  };

  const [secondTaskNo, setSecondTaskNo] = useState("");
  const secondInputField = (e) => {
    setSecondTaskNo(e.target.value);
  };

  const [thirdTaskNo, setThirdTaskNo] = useState("");
  const thirdInputField = (e) => {
    setThirdTaskNo(e.target.value);
  };

  // console.log(firstTaskNo, secondTaskNo, thirdTaskNo);

  const concatenatedString =
    firstTaskNo + " " + secondTaskNo + " " + thirdTaskNo || "";

  const [isButtonClicked, setIsButtonClicked] = useState(false);

  const getShiftLog = () => {
    axios
      .post(baseURL + "/ShiftOperator/getShiftLog", {
        selectshifttable: selectshifttable,
      })
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          // FOR TgtDelDate
          let dateSplit = response.data[i].FromTime.split(" ");
          let date = dateSplit[0].split("-");
          let year = date[0];
          let month = date[1];
          let day = date[2];
          let finalDay = day + "/" + month + "/" + year + " " + dateSplit[1];
          response.data[i].FromTime = finalDay;
        }
        for (let i = 0; i < response.data.length; i++) {
          // Delivery_date
          let dateSplit1 = response.data[i].ToTime.split(" ");
          let date1 = dateSplit1[0].split("-");
          let year1 = date1[0];
          let month1 = date1[1];
          let day1 = date1[2];
          let finalDay1 =
            day1 + "/" + month1 + "/" + year1 + " " + dateSplit1[1];
          response.data[i].ToTime = finalDay1;
        }
        setShiftLogDetails(response.data);
      });
  };


  //stoppage onclick of yes
  const onClickYes = () => {
    if (concatenatedString.trim()) {
      // console.log("excuting First Condition")
      if (!isButtonClicked) {
        setIsButtonClicked(true);
        axios
          .post(baseURL + "/ShiftOperator/addStoppageTaskNo", {
            selectshifttable: selectshifttable,
            selectedStoppageID: selectedStoppageID,
            selectedStoppage: selectedStoppage,
            concatenatedString: concatenatedString,
          })
          .then((response) => {
            toast.success("Stoppage Added Successfully", {
              position: toast.POSITION.TOP_CENTER,
            });
            setFormData([]);
            getShiftLog();
          });
      }
    } else {
      if (!isButtonClicked) {
        setIsButtonClicked(true);
        axios
          .post(baseURL + "/ShiftOperator/addStoppage", {
            selectshifttable: selectshifttable,
            selectedStoppageID: selectedStoppageID,
            selectedStoppage: selectedStoppage,
            concatenatedString: concatenatedString,
          })
          .then((response) => {
            toast.success("Stoppage Added Successfully", {
              position: toast.POSITION.TOP_CENTER,
            });
            // console.log(" before excuted")
            setFormData([]);
            // console.log("excuted")
            getShiftLog();
          });
      }
    }

    axios
      .post(baseURL + "/ShiftOperator/updateMachineTime", {
        Machine: selectshifttable?.Machine,
      })
      .then((response) => {});
    setAlreadyLoad(false);
    setShowTable(false);
    setInputVisible(!isInputVisible);
    setIsButtonClicked(false);
    getMachineShiftStatusForm();
  };



  useEffect(() => {
    getShiftLog();
    getmiddleTbaleData();
  }, []);

  return (
    <div>
      <div>
        <Modal show={alreadyLoad} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title style={{fontSize:'14px'}}>magod_machine</Modal.Title>
          </Modal.Header>

          <Modal.Body style={{fontSize:'12px'}}>
            Do you wish to stop the cutting for <b>{selectedStoppage}</b> ?
            <div className="d-flex  col-md-12 mt-2">
              <label className="form-label col-md-3">Task No</label>
              <input
                style={{ marginLeft: "-40px" }}
                className="in-field col-md-3"
                onChange={firstInputField}
                disabled={disableTaskNo}
              />

              <input
                style={{ marginLeft: "-60px" }}
                className="in-field ms-2 col-md-1"
                onChange={secondInputField}
                disabled={disableTaskNo}
              />

              <input
                style={{ marginLeft: "-60px" }}
                className="in-field ms-2 col-md-1"
                onChange={thirdInputField}
                disabled={disableTaskNo}
              />
            </div>
          </Modal.Body>

          <Modal.Footer>
            <button
              className="group-button button-style"
              onClick={onClickYes}
              disabled={isButtonClicked}
            >
              Yes
            </button>
            <button className="group-button button-style" onClick={handleClose}>
              No
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
