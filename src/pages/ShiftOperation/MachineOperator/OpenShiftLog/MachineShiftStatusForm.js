import React, { useEffect, useState } from "react";
import { baseURL } from "../../../../api/baseUrl";
import axios from "axios";
import { useGlobalContext } from "../../../../Context/Context";

export default function MachineShiftStatusForm({
  selectshifttable,
  Shift,
  finalDay1,
  date,
  showTable,
  machineShiftStatus,
  getMachineShiftStatusForm,
}) {
  const { selectedProgram } = useGlobalContext();


  var count = 0;
  const [isInputVisible, setInputVisible] = useState(false);

  const toggleInput = () => {
    count = count + 1;
    if (count === 1) {
      setInputVisible(true);
    } else {
      setInputVisible(false);
      ///ChangeOperator
      axios
        .post(baseURL + "/ShiftOperator/updateOperator", {
          Operator: ChangedOperator,
          selectshifttable,
        })
        .then((response) => {
          getMachineShiftStatusForm();
        });
    }
  };

  const [operatorsList, setOperatorsList] = useState([]);
  useEffect(() => {
    axios.get(baseURL + "/ShiftOperator/getShiftIncharge").then((response) => {
      // console.log(response.data);
      setOperatorsList(response.data);
    });
  }, []);
  const [ChangedOperator, setChangedOperator] = useState("");
  const handleShiftIncharge = (e) => {
    setChangedOperator(e.target.value);
  };

  const formatDateTime = (dateTimeString) => {
    const dateObject = new Date(dateTimeString);

    // Get day and month components
    const day = dateObject.getDate().toString().padStart(2, "0");
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0"); 

    // Get hour and minute components
    const hour = dateObject.getHours().toString().padStart(2, "0");
    const minute = dateObject.getMinutes().toString().padStart(2, "0");

    // Combine components to form the desired format
    const formattedDate = `${day}/${month} ${hour}:${minute}`;

    return formattedDate;
  };

  // console.log(machineShiftStatus[0])

  //program Time
  const [runningTime, setRunningTime] = useState("");
  useEffect(() => {
    const updateRunningTime = () => {
      if (machineShiftStatus && machineShiftStatus.length > 0) {
        const programStartTime = new Date(
          machineShiftStatus[0]?.ProgramStartTime
        );

        if (!isNaN(programStartTime.getTime())) {
          const currentTime = new Date();
          const diffInMilliseconds = currentTime - programStartTime;

          if (diffInMilliseconds >= 0) {
            const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
            );

            setRunningTime(`${hours} hours ${minutes} mins`);
          } else {
            setRunningTime("0");
          }
        } else {
          setRunningTime("0");
        }
      } else {
        setRunningTime("0");
      }
    };
    updateRunningTime();
    const intervalId = setInterval(updateRunningTime, 30000);
    return () => clearInterval(intervalId);
  }, [machineShiftStatus]);

  // Save runningTime to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("runningTime", runningTime);
  }, [runningTime]);

  //update sheettime
  const [sheetrunTime, setSheetRuntime] = useState("");

  const updateSheettime = () => {
    if (machineShiftStatus && machineShiftStatus.length > 0) {
      const SheetStartTime = new Date(machineShiftStatus[0]?.SheetStartTime);

      if (!isNaN(SheetStartTime.getTime())) {
        const currentTime = new Date();
        const diffInMilliseconds = currentTime - SheetStartTime;

        if (diffInMilliseconds >= 0) {
          const hours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
          const minutes = Math.floor(
            (diffInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
          );

          setSheetRuntime(`${hours} hours ${minutes} mins`);
        } else {
          setSheetRuntime("0");
        }
      } else {
        setSheetRuntime("0");
      }
    } else {
      setSheetRuntime("0");
    }
  };

  useEffect(() => {
    if (machineShiftStatus[0]?.MtrlID === "") {
      setSheetRuntime(runningTime);
    } else {
      updateSheettime();
    }
  }, [machineShiftStatus, runningTime]);

  useEffect(() => {
    localStorage.setItem("runningTime", sheetrunTime);
  }, [sheetrunTime]);

  useEffect(() => {
    getMachineShiftStatusForm();
  }, []);


  useEffect(() => {
    getMachineShiftStatusForm();
  }, []);

  //getCurrent date
  const [currentDate, setCurrentDate] = useState("");
  function getCurrentDate() {
    const currentDate = new Date();
    const day = currentDate.getDate();
    const month = currentDate.getMonth() + 1; 
    const formattedDate = `${day < 10 ? "0" : ""}${day}/${
      month < 10 ? "0" : ""
    }${month}`;
    return formattedDate;
  }

    // Periodically update the time and date every second (1000 milliseconds)
    useEffect(() => {
      const intervalId = setInterval(() => {
        // Update the time and date
        setCurrentDate(getCurrentDate());
      }, 1000);
  
      // Clean up the interval when the component is unmounted
      return () => clearInterval(intervalId);
    }, []); 


  return (
    <>
      <div className="">
        <div
          style={{
            backgroundColor: "#d3d3d3",
            // marginTop: "2px",
            marginLeft: "-12px",
            fontSize: "14px",
            width:'114%'
          }}
        >
          <div style={{marginLeft:"50px"}}>
            <label className="form-label">{currentDate} &nbsp; <span style={{color:"red"}}>{selectshifttable?.Shift}</span> &nbsp; Shift </label>
          </div>

          <div className="d-flex ms-4">
            <div style={{ width: "auto", textAlign: "left" }}>
              <div style={{ marginLeft: "5px" }}>
                <div style={{ marginTop: "-8px" }}>
                  <label className="form-label">
                    Operator : {selectshifttable?.Operator}
                  </label>
                </div>
                <div style={{ marginTop: "-8px" }}>
                  <label className="form-label">
                    Current : {machineShiftStatus[0]?.Operator}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex">
            <button
              className="button-style group-button mb-2"
              style={{ width: "50px", marginLeft: "10px" }}
              onClick={toggleInput}
            >
              Select{" "}
              {isInputVisible ? (
                <div
                  className="col-md-12"
                  style={{
                    marginLeft: "50px",
                    marginTop: "-20px",
                    width: "280%",
                  }}
                >
                  <select className="ip-select" onChange={handleShiftIncharge}>
                    <option selected>Select Shift Incharge</option>
                    {operatorsList.map((operatorsList) => (
                      <option value={operatorsList}>{operatorsList}</option>
                    ))}
                  </select>
                </div>
              ) : (
                ""
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-1">
        <div
          style={{
            backgroundColor: "#d3d3d3",
            marginLeft: "-12px",
            fontSize: "14px",
            width:'114%'
          }}
        >
          <div style={{ textAlign: "center" }}>
            <label className="form-label">Process Task Status</label>
          </div>
          <div className="d-flex" style={{ marginTop: "-9px" }}>
            <div style={{ width: "auto", textAlign: "left" }}>
              <div style={{ marginLeft: "15px" }}>
                <label className="form-label">
                  Task No : {machineShiftStatus[0]?.TaskNo}{" "}
                </label>
              </div>

              <div style={{ marginLeft: "15px", marginTop: "-8px" }}>
                <label className="form-label">
                  Operation : {machineShiftStatus[0]?.Operation}
                </label>
              </div>
              <div style={{ color: "", marginLeft: "15px", marginTop: "-8px" }}>
                <label className="form-label">
                  Material : {machineShiftStatus[0]?.Mtrl_Code}{" "}
                </label>
              </div>

              <div style={{ marginLeft: "15px", marginTop: "-8px" }}>
                <label className="form-label">
                  Program no : {machineShiftStatus[0]?.NCProgarmNo}
                </label>
              </div>
              <div style={{ marginLeft: "15px", marginTop: "-8px" }}>
                <label className="form-label">
                  Start Time :
                  {formatDateTime(machineShiftStatus[0]?.ProgramStartTime)}
                </label>
              </div>

              <div
                className="mb-1"
                style={{ color: "", marginLeft: "15px", marginTop: "-8px" }}
              >
                <label className="form-label">Running For :{runningTime}</label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-1">
        <div
          className=""
          style={{
            backgroundColor: "#d3d3d3",
            marginLeft: "-12px",
            fontSize: "14px",
            height: "100px",
            width:'114%'
          }}
        >
          <div>
            <div style={{ textAlign: "center" }}>
              <label className="form-label">Material Machine Time</label>
            </div>
            <div className="d-flex mx-2" style={{ marginTop: "-4px" }}>
              <div style={{ width: "auto", textAlign: "left" }}>
                <div style={{ marginLeft: "10px", marginTop: "-6px" }}>
                  <label className="form-label">
                    Sheet Id :{machineShiftStatus[0]?.MtrlID}
                  </label>
                </div>
                <div style={{ marginLeft: "10px", marginTop: "-8px" }}>
                  <label className="form-label">
                    Start Time :
                    {formatDateTime(machineShiftStatus[0]?.SheetStartTime)}
                  </label>
                </div>
                <div style={{ marginLeft: "10px", marginTop: "-8px" }}>
                  <label className="form-label">
                    Running For :{sheetrunTime}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
