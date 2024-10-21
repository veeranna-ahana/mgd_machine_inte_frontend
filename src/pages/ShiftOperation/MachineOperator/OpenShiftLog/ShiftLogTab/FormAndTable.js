import axios from "axios";
import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { baseURL } from "../../../../../api/baseUrl";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useGlobalContext } from "../../../../../Context/Context";
import GlobalModal from "../../GlobalModal";
import moment from "moment";

export default function FormAndTable({
  getShiftLogDetails,
  selectshifttable,
  setShowTable,
}) {
  const {
    setShiftLogDetails,
    shiftLogDetails,
    timeDiffInMinutes,
    setTimeDiffInMinutes,
  } = useGlobalContext();
  const [open, setOpen] = useState(false);

  // console.log("shiftLogDetails",shiftLogDetails);

  const blockInvalidChar = (e) => {
  const invalidChars = [
    "!",
    "@",
    "#",
    "$",
    "%",
    "^",
    "&",
    "*",
    "(",
    ")",
    "_",
    "-",
    "+",
    "=",
    "|",
    "}",
    "{",
    "[",
    "]",
    ".",
    ",",
    "?", 
    '"',
    "<",
    ">",
    "`",
    "~",
    ";",
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
  ];
  if (invalidChars.includes(e.key) || e.key === "'" || e.key === "\\") {
    e.preventDefault();
  }
}

  const handleTimeChange = (index, field, value) => {
        const maxLength = 19; // Length of 'DD/MM/YYYY HH:MM:SS'

    if (value.length > maxLength) {
        toast.error(`Invalid ${field} format. Please use DD/MM/YYYY HH:MM:SS`, {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    if(value.length ===0){
      toast.error(`Input field cannot be empty`, {
        position: toast.POSITION.TOP_CENTER,
      });
    }

    const updatedshiftLogDetails = [...shiftLogDetails]; // Create a copy of the array
    // Update the specific item's field with the new value
    updatedshiftLogDetails[index] = {
      ...updatedshiftLogDetails[index],
      [field]: value,
    };
    setShiftLogDetails(updatedshiftLogDetails);
  };

  const saveShiftLog = () => {
      // Regular expression to validate dd/mm/yyyy HH:MM format
      const dateTimeRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4} ([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
        
      // Check if any log entry has empty or invalid FromTime or ToTime
      for (let log of shiftLogDetails) {
        if (!log.FromTime || !log.ToTime) {
          toast.error("FromTime and ToTime cannot be empty", {
            position: toast.POSITION.TOP_CENTER,
          });
          return;
        }
        if (!dateTimeRegex.test(log.FromTime) || !dateTimeRegex.test(log.ToTime)) {
          toast.error("FromTime and ToTime must be in the format dd/mm/yyyy HH:MM and within valid ranges", {
            position: toast.POSITION.TOP_CENTER,
          });
          return;
        }
      }

    // console.log(shiftLogDetails);
    axios
      .post(baseURL + "/ShiftOperator/saveShiftLog", { shiftLogDetails })
      .then((response) => {
        toast.success(`Sucessfully Saved`, {
          position: toast.POSITION.TOP_CENTER,
        }); 
           })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
    getShiftLogDetails();
  };

  const openCloseModal = () => {
    setOpen(true); // Open the modal
  };

  const handleClose = () => {
    setOpen(false);
  };

  //disable inputs
  const [disableInputs, setDisableInputs] = useState(false);
  //PreapreShift
  const onClickPrepareShift = () => {
    axios
      .post(baseURL + "/ShiftOperator/prepareShift", { selectshifttable })
      .then((response) => {
        axios
          .post(baseURL + "/ShiftOperator/getShiftLog", {
            selectshifttable: selectshifttable,
          })
          .then((response) => {
            for (let i = 0; i < response.data.length; i++) {
              let dateSplit = response.data[i].FromTime.split(" ");
              let date = dateSplit[0].split("-");
              let year = date[0];
              let month = date[1];
              let day = date[2];
              let finalDay =
                day + "/" + month + "/" + year + " " + dateSplit[1];
              response.data[i].FromTime = finalDay;
            }
            for (let i = 0; i < response.data.length; i++) {
              let dateSplit1 = response.data[i].ToTime.split(" ");
              let date1 = dateSplit1[0].split("-");
              let year1 = date1[0];
              let month1 = date1[1];
              let day1 = date1[2];
              let finalDay1 =
                day1 + "/" + month1 + "/" + year1 + " " + dateSplit1[1];
              response.data[i].ToTime = finalDay1;
            }
            for (let i = 0; i < response.data.length; i++) {
              if (i !== response.data.length - 1) {
                // Check if it's not the last row
                if (response.data[i].Locked === 1) {
                  response.data[i].rowColor = "#87CEEB";
                } else {
                }
              }
            }
            setShiftLogDetails(response.data);
            setDisableInputs(true);
          });
      });
  };

  //CloseShift
  const onClickofYesCloseShift = () => {
    axios
      .post(baseURL + "/ShiftOperator/closeShift", { selectshifttable })
      .then((response) => {
        toast.success("shift Closed", {
          position: toast.POSITION.TOP_CENTER,
        });
        axios
          .post(baseURL + "/ShiftOperator/getShiftLog", {
            selectshifttable: selectshifttable,
          })
          .then((response) => {
            // console.log(response.data);
            for (let i = 0; i < response.data.length; i++) {
              let dateSplit = response.data[i].FromTime.split(" ");
              let date = dateSplit[0].split("-");
              let year = date[0];
              let month = date[1];
              let day = date[2];
              let finalDay =
                day + "/" + month + "/" + year + " " + dateSplit[1];
              response.data[i].FromTime = finalDay;
            }
            for (let i = 0; i < response.data.length; i++) {
              let dateSplit1 = response.data[i].ToTime.split(" ");
              let date1 = dateSplit1[0].split("-");
              let year1 = date1[0];
              let month1 = date1[1];
              let day1 = date1[2];
              let finalDay1 =
                day1 + "/" + month1 + "/" + year1 + " " + dateSplit1[1];
              response.data[i].ToTime = finalDay1;
            }
            for (let i = 0; i < response.data.length; i++) {
              if (response.data[i].Locked === 1) {
                response.data[i].rowColor = "#87CEEB";
              } else {
                // console.log(null);
              }
            }
            setShiftLogDetails(response.data);
            handleClose();
            // console.log("before false condition");
            setShowTable(false);
            // console.log("excicuted false condition");
          })
          .catch((error) => {
            // Handle errors from the second API call
            // console.error(error);
          });
      })
      .catch((error) => {
        // Handle errors from the first API call
        console.error(error);
      });
  };

  const upDate = () => {
    saveShiftLog();
  };

  const [currentTime, setCurrentTime] = useState("");
  const getCurrentTime = () => {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const seconds = currentDate.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  //getCurrent date
  const [currentDate, setCurrentDate] = useState("");
  const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    // console.log("Effect is running...");
    const intervalId = setInterval(() => {
      // console.log("Updating time and date...");
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDate());
    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(intervalId);
      // console.log("Interval cleared.");
    };
  }, []);

  const setFormattedShiftLog = (shiftLogData) => {
    const formattedShiftLog = shiftLogData.map((item) => {
      const fromTime = new Date(item.FromTime);
      const toTime = new Date(item.ToTime);

      return {
        ...item,
        FromTime: fromTime.toLocaleString(),
        ToTime: toTime.toLocaleString(),
        SrlTime: calculateSrlTime(fromTime, toTime),
      };
    });

    setShiftLogDetails(formattedShiftLog);
  };

  const calculateSrlTime = (fromTime, toTime) => {
    const timeDiffInMinutes = Math.floor((toTime - fromTime) / (60 * 1000));
    return timeDiffInMinutes.toString();
  };

  useEffect(() => {
    getShiftLogDetails();
  }, []);

  //sorting
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    const dataCopy = [...shiftLogDetails];
    if (sortConfig.key) {
      dataCopy.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return dataCopy;
  };

  //
  // Function to calculate time difference based on provided fromTime and toTime
  const calculateTimeDiffInMinutes = (fromTime, toTime) => {
    const fromTimeMoment = moment(fromTime, "DD/MM/YYYY HH:mm:ss", true);
    const toTimeMoment = moment(toTime, "DD/MM/YYYY HH:mm:ss", true);

    if (fromTimeMoment.isValid() && toTimeMoment.isValid()) {
      const timeDiffInMinutes = Math.floor(
        toTimeMoment.diff(fromTimeMoment, "minutes")
      );
      return timeDiffInMinutes;
    } else {
      return 0; // Return 0 if invalid date format
    }
  };
  const updateTime = () => {
    const formattedTime = getCurrentTime();
    setCurrentTime(formattedTime);
  };

  useEffect(() => {
    // Update the current time every minute
    const intervalId = setInterval(updateTime, 60000); // 60000 milliseconds = 1 minute

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const updateTimeDiffState = () => {
    const lastShiftFromTime =
      shiftLogDetails[shiftLogDetails.length - 1].FromTime;
    const toTime = `${currentDate} ${currentTime}`;
    const diffInMinutes = calculateTimeDiffInMinutes(lastShiftFromTime, toTime);
    // console.log("toTime is",toTime);
    setTimeDiffInMinutes(diffInMinutes);
  };

  useEffect(() => {
    // Update time difference state when component mounts
    if (shiftLogDetails.length > 0) {
      updateTimeDiffState();
    }
  }, [shiftLogDetails, currentTime]);

  // console.log("timeDiffInMinutes is",timeDiffInMinutes);

  return (
    <div>
      <GlobalModal
        show={open}
        title="magod_machine"
        content={
          <>
            The current Shift Serial will be closed and Shift Report will be
            Submitted <br />
            Machine Status will be set as 'Shift Closed' and Form Closed Do you
            wish to close the Shift?
          </>
        }
        onYesClick={onClickofYesCloseShift}
        onNoClick={handleClose}
        onClose={handleClose}
      />
      <div className="col-md-6 col-sm-12">
        <label className="form-label ms-2"> Shift Log Book </label>
      </div>
      <div className="row mb-1">
        <div className="col-md-3 col-sm-12">
          <button className="button-style  group-button" onClick={saveShiftLog}>
            Save
          </button>
        </div>

        <div className="col-md-3 col-sm-12">
          <button
            className="button-style  group-button"
            onClick={openCloseModal}
          >
            Close Shift
          </button>
        </div>
        <div className="col-md-3 col-sm-12">
          <button
            className="button-style  group-button"
            onClick={onClickPrepareShift}
          >
            Prepare
          </button>
        </div>
        <div className="col-md-3 col-sm-12">
          <button className="button-style  group-button" onClick={upDate}>
            UpDate
          </button>
        </div>
      </div>

      <div
        className="col-md-12"
        style={{ overflowY: "scroll", overflowX: "scroll", height: "250px" }}
      >
        <Table striped className="table-data border table-space">
          <thead className="tableHeaderBGColor" style={{ fontSize: "12PX" }}>
            <tr>
              <th onClick={() => requestSort("Srl")}>Srl</th>
              <th onClick={() => requestSort("Program")}>Program </th>
              <th>From Time</th>
              <th>To Time</th>
              <th onClick={() => requestSort("Remarks")}>Remarks</th>
              <th>Srl Time</th>
              <th onClick={() => requestSort("Locked")}>Locked</th>
              <th onClick={() => requestSort("QtyProcessed")}>Process</th>
            </tr>
          </thead>
          <tbody className="tablebody table-space">
            {sortedData().map((item, key) => {
              const isLastRow = key === shiftLogDetails.length - 1;
              let srlTime = "";

              if (isLastRow) {
                const fromTime = new Date(item.FromTime).toLocaleString();
                const currentTime = new Date().toLocaleString();

                if (
                  !isNaN(new Date(fromTime).getTime()) &&
                  !isNaN(new Date(currentTime).getTime())
                ) {
                  const timeDiffInMinutes = Math.floor(
                    (new Date(currentTime) - new Date(fromTime)) / (60 * 1000)
                  );
                  srlTime = timeDiffInMinutes.toString();
                } else {
                  // console.error("Invalid date format");
                }
              }
              const rowStyle = {
                backgroundColor: item.Locked === 1 ? item.rowColor : "inherit",
              };

              return (
                <tr style={rowStyle} key={key}>
                  <td>{key + 1}</td>
                  <td>{item.Program}</td>
                  <td>
                    <input
                      className="table-cell-editor"
                      style={{ textAlign: "center", width: "150px" }}
                      value={item?.FromTime}
                      onKeyDown={blockInvalidChar}
                      onChange={(e) =>
                        handleTimeChange(key, "FromTime", e.target.value)
                      }
                      disabled={item.Locked === 1}
                    />
                  </td>
                  <td>
                    {isLastRow ? (
                      <input
                        className="table-cell-editor"
                        style={{ textAlign: "center", width: "150px" }}
                        onKeyDown={blockInvalidChar}
                        value={`${currentDate} ${currentTime}`}
                        readOnly
                        disabled={item.Locked === 1}
                      />
                    ) : (
                      <input
                        className="table-cell-editor"
                        style={{ textAlign: "center", width: "150px" }}
                        value={item?.ToTime}
                        onKeyDown={blockInvalidChar}
                        onChange={(e) =>
                          handleTimeChange(key, "ToTime", e.target.value)
                        }
                        disabled={item.Locked === 1}
                      />
                    )}
                  </td>
                  <td>
                    <input
                      className="table-cell-editor"
                      defaultValue={item.Remarks === "null" ? "" : item.Remarks}
                      onChange={(e) =>
                        handleTimeChange(key, "Remarks", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    {isLastRow
                      ? (() => {
                          const fromTime = moment(
                            item.FromTime,
                            "DD/MM/YYYY HH:mm:ss",
                            true
                          );
                          const formattedCurrentTime = `${currentDate} ${currentTime}`;
                          const toTime = moment(
                            formattedCurrentTime,
                            "DD/MM/YYYY HH:mm:ss",
                            true
                          );

                          // console.log("fromTime is", fromTime);
                          // console.log("toTime is", toTime);

                          if (fromTime.isValid() && toTime.isValid()) {
                            const timeDiffInMinutes = Math.floor(
                              toTime.diff(fromTime, "minutes")
                            );
                            // console.log("timeDiffInMinutes:", timeDiffInMinutes);

                            return timeDiffInMinutes >= 0
                              ? `${timeDiffInMinutes}`
                              : "0";
                          } else {
                            // Handle invalid date format
                            return "0";
                          }
                        })()
                      : item.SrlTime
                      ? `${item.SrlTime}`
                      : "0"}
                  </td>

                  <td>
                    <input type="checkbox" checked={item.Locked === 1} />
                  </td>
                  <td>{item.QtyProcessed}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
