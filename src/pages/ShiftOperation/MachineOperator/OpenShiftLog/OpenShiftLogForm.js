import React, { useEffect, useState } from "react";
import ErrorReportForm from "./ErrorReportForm";
import { baseURL } from "../../../../api/baseUrl";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import StoppageAskModal from "./StoppageAskModal";
import { useGlobalContext } from "../../../../Context/Context";
import { ToastContainer, toast } from "react-toastify";

export default function OpenShiftLogForm({
  selectedMachine,
  finalDay1,
  selectshifttable,
  setShowTable,
  showTable,
  getShiftSummaryData,
  getMachinetaskdata,
  setMachinetaskdata,
  getMachineShiftStatusForm,
  getMachineTaskData,
  getmiddleTbaleData,
}) {
  const { setShiftLogDetails } = useGlobalContext();
  // console.log(selectshifttable);

  const onClickgetProgram = () => {
    getMachineTaskData();
  };
  const [errorForm, setErrorForm] = useState(false);
  const [isInputVisible, setInputVisible] = useState(false);
  const [alreadyLoad, setAlreadyLoad] = useState(false);
  const [stoppageID, setStoppageID] = useState("");
  const [stoppageList, setStoppageList] = useState([]);
  const [stoppageReasonList, setStoppageReasonList] = useState([]);
  const [stoppageReason, setStoppageReason] = useState("");

  const toggleInput = () => {
    setInputVisible(!isInputVisible);
  };

  const handleOpen = () => {
    setErrorForm(true);
  };

  let Machine = selectshifttable?.Machine;
  const refreshSubmit = () => {
    setInputVisible(false);
    getShiftSummaryData();
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
      });
  };

  useEffect(() => {
    getShiftSummaryData();
  }, [selectshifttable]);

  let array = finalDay1?.split("/");
  let finalDay = array[0] + "/" + array[1];

  const [selectedStoppageID, setSelectedStoppageID] = useState("");
  const [selectedStoppage, setSelectedStoppage] = useState("");

  const selectBothOption = (e) => {
    axios
      .post(baseURL + "/ShiftOperator/getShiftLog", {
        selectshifttable: selectshifttable,
      })
      .then((response) => {
        // Check if the last object's Program is the same as selectedStoppage
        const lastObject = response.data[response.data.length - 1];
        if (lastObject && lastObject.Program !== selectedStoppage) {
          // Show toastify error because it's already present
          setAlreadyLoad(true);
        } else {
          // Set alreadyLoad to true
          showToastifyError();
        }
      });
    setStoppageReason(e.target.value);
    const selectedStoppageID = e.target.value;
    const selectedStoppage = e.target.selectedOptions[0].dataset.stoppage;
    setSelectedStoppageID(selectedStoppageID);
    setSelectedStoppage(selectedStoppage);
  };

  const showToastifyError = () => {
    // Replace this with your actual logic to show a toastify error
    // Example using toastify or any other notification library
    toast.error("Already Loaded", {
      position: toast.POSITION.TOP_CENTER,
    });
  };

  const [disableTaskNo, setDisableTaskNo] = useState(true);
  const handleChangeStoppageList = (e) => {
    if (e.target.value === "9") {
      setStoppageID(e.target.value);
      setDisableTaskNo(false);
    } else {
      setStoppageID(e.target.value);
      setDisableTaskNo(true);
    }
  };

  const getStoppageReasonList = () => {
    axios
      .post(baseURL + "/ShiftOperator/stoppageReasonList", {
        stoppageID: stoppageID,
      })
      .then((response) => {
        setStoppageReasonList(response.data);
        // console.log(response.data);
      });
  };

  const getStoppageList = () => {
    axios.get(baseURL + "/ShiftOperator/stoppageList").then((response) => {
      setStoppageList(response.data);
      // console.log(response.data)
    });
  };

  useEffect(() => {
    getStoppageList();
  }, []);

  useEffect(() => {
    getStoppageReasonList();
  }, [stoppageID]);

  //Current  Time
  const [currentTime, setCurrentTime] = useState("");
  const getCurrentTime = () => {
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const formattedTime = `${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`;
    return formattedTime;
  };

  //getCurrent date
  const [currentDate, setCurrentDate] = useState("");
  function getCurrentDate() {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; // Months are zero-based
    const formattedDate = `${day < 10 ? "0" : ""}${day}/${
      month < 10 ? "0" : ""
    }${month}`;
    return formattedDate;
  }

  // Periodically update the time and date every second (1000 milliseconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Update the time and date
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDate());
    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures that the effect runs only once on mount

  const navigate = useNavigate();
  const onClickofClose = () => {
    navigate("/Machine");
  };

  return (
    <>
      <div className="row">
        <h4 className="title">Machine Log Book</h4>
      </div>

      <div className="row">
        <div className="col-md-5" style={{marginTop:'-10px'}}>
          <div>
            <label className="form-label">
              Machine Operator information and Working Form
            </label>
          </div>
          <div className="d-flex" style={{ gap: "20px", marginTop:'-10px' }}>
            <div>
              <label className="form-label">{selectedMachine}</label>
            </div>
            <div>
              <label className="form-label">
                {currentDate} {currentTime}
              </label>
            </div>
            <div>
              <label className="form-label">Status</label>
            </div>

            <div>
              <label className="form-label">OFF</label>
            </div>
          </div>
        </div>
        <div className="col-md-7">
          <div className="row">
            {isInputVisible && (
              <div className="col-md-3">
                <div>
                  <select
                    className="ip-select"
                    onChange={handleChangeStoppageList}
                  >
                    <option>Choose an option</option>
                    {stoppageList.map((value, key) => (
                      <option value={value.StoppageGpId} key={key}>
                        {value.GroupName}
                      </option>
                    ))}
                  </select>

                  <select className="ip-select" onChange={selectBothOption}>
                    <option>Choose an option</option>
                    {stoppageReasonList.map((value, key) => (
                      <option
                        value={value.StoppageID}
                        data-stoppage={value.Stoppage}
                        key={key}
                      >
                        {value.Stoppage}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            <div className="col-md-9">
              <button
                className="button-style group-button"
                onClick={toggleInput}
              >
                Stoppage
              </button>

              <button
                className="button-style group-button"
                onClick={onClickgetProgram}
              >
                Get Program
              </button>
              <button
                className="button-style group-button"
                onClick={handleOpen}
              >
                Error Report
              </button>
              <button
                className="button-style group-button"
                onClick={refreshSubmit}
              >
                Refresh
              </button>
              <button
                className="button-style group-button"
                onClick={onClickofClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* <div className="row mb-1">
        <div className="col-md-12">
          <div className="row">
            <div className="col-md-1 col-sm-12">
              <label className="form-label">{selectedMachine}</label>
            </div>

            <div className="col-md-2 col-sm-12">
              <label className="form-label">
                {currentDate} {currentTime}
              </label>
            </div>

            <div className="col-md-1 col-sm-12" style={{ marginLeft: "-50px" }}>
              <label className="form-label">Status</label>
            </div>

            <div className="col-md-1 col-sm-12">
              <label className="form-label">OFF</label>
            </div>
          </div>
        </div>
      </div> */}

      <ErrorReportForm
        errorForm={errorForm}
        setErrorForm={setErrorForm}
        selectedMachine={selectedMachine}
        selectshifttable={selectshifttable}
        setShowTable={setShowTable}
      />

      <StoppageAskModal
        setAlreadyLoad={setAlreadyLoad}
        alreadyLoad={alreadyLoad}
        selectedStoppageID={selectedStoppageID}
        selectshifttable={selectshifttable}
        selectedStoppage={selectedStoppage}
        setShowTable={setShowTable}
        showTable={showTable}
        setInputVisible={setInputVisible}
        isInputVisible={isInputVisible}
        getMachineShiftStatusForm={getMachineShiftStatusForm}
        disableTaskNo={disableTaskNo}
        getmiddleTbaleData={getmiddleTbaleData}
      />
    </>
  );
}
