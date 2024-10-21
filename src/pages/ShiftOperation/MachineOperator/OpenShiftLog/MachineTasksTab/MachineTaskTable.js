import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import LoadProgramModal from "./LoadProgramModal";
import axios from "axios";
import { baseURL } from "../../../../../api/baseUrl";
import MachineTaskProfile from "./MachineTaskProfile";
import { useGlobalContext } from "../../../../../Context/Context";
import GlobalModal from "../../GlobalModal";
import ErrorModal from "./ErrorModal";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import MachineTaskService from "./MachineTaskService";

export default function MachineTaskTable({
  selectshifttable,
  getMachinetaskdata,
  afterLoadProgram,
  setShowTable,
  getMachineShiftStatusForm,
  showTable,
}) {
  const {
    NcId,
    setNcId,
    selectedProgram,
    setSelectedProgram,
    setShiftLogDetails,
    shiftLogDetails,
    setFormData,
    hasBOM,
    setHasBOM,
    machineTaskService,
    setMachineTaskDataService,
    afterloadService,
    setAfterloadService,
    servicetopData,
    setServiceTopData,
    pgmNo,
    setPgmNo,
  } = useGlobalContext();

  // Modal Related code....
  const [open, setOpen] = useState(false);
  const [isDataDisplayed, setIsDataDisplayed] = useState(false);
  const [ErrorshowModal, setErrorshowModal] = useState(false);

  const openModal = () => {
    if (isDataDisplayed && pgmNo != selectedProgram.NCProgramNo) {
      setOpen(true); // Open the modal
    } else if (isDataDisplayed && pgmNo === selectedProgram.NCProgramNo) {
      setOpen(false);
    } else {
      setErrorshowModal(true); // Display the error message
    }
  };

  //update Machine Time
  const updateMachineTime = () => {
    axios
      .post(baseURL + "/ShiftOperator/updateMachineTime", {
        Machine: selectshifttable?.Machine,
      })
      .then((response) => {});
  };

  useEffect(() => {
    updateMachineTime();
  }, [selectshifttable]);

  //Submit Load
  const handleSubmit = () => {
    if (hasBOM === true) {
      getServiceMachineTask();
      setAfterloadService(machineTaskService);
    } else {
      afterLoadProgram();
    }
    setFormData(selectedProgram);
    axios
      .post(baseURL + "/ShiftOperator/loadProgram", {
        selectedProgram,
        selectshifttable,
      })
      .then((response) => {
        toast.success("Program Loaded Successfully", {
          position: toast.POSITION.TOP_CENTER,
        });
        updateMachineTime();
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
            // console.log(response.data);
            setShiftLogDetails(response.data);
          });
        getMachineShiftStatusForm();
      });
    setMachineTaskData([]);
    setMachineTaskDataService([]);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  //select MachineTask Row nad Checking BOM
  const selectProgramFun = (item, index) => {
    let list = { ...item, index: index };
    setSelectedProgram(list);
    // console.log(list);
    axios
      .post(baseURL + "/ShiftOperator/checkhasBOM", {
        NCId: list?.Ncid,
      })
      .then((response) => {
        // console.log(response.data);
        setHasBOM(response.data);
      });
  };

  useEffect(() => {
    if (getMachinetaskdata.length > 0 && !selectedProgram.NCProgramNo) {
      selectProgramFun(getMachinetaskdata[0], 0); // Select the first row
    }
  }, [getMachinetaskdata, selectedProgram, selectProgramFun]);

  //servicedata
  const [machineTaskData, setMachineTaskData] = useState([]);
  const getServiceMachineTask = () => {
    axios
      .post(baseURL + "/ShiftOperator/getTableTopDeatails", {
        NCId: selectedProgram?.Ncid,
      })
      .then((response) => {
        // console.log(response.data);
        setServiceTopData(response.data);
      });
    axios
      .post(baseURL + "/ShiftOperator/MachineTasksService", {
        NCId: selectedProgram?.Ncid,
      })
      .then((response) => {
        // console.log(response.data);
        setMachineTaskDataService(response.data);
        setIsDataDisplayed(true); // Data is displayed
        setShowTable(true);
        // setIsDataDisplayed(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //doubleclick row
  const [newTableTopData, setNewTableTopData] = useState([]);
  const machinetask = () => {
    // console.log(hasBOM)
    if (hasBOM === true) {
      axios
        .post(baseURL + "/ShiftOperator/MachineTasksService", {
          NCId: selectedProgram?.Ncid,
        })
        .then((response) => {
          // console.log(response.data);
          setMachineTaskDataService(response.data);
          setIsDataDisplayed(true); // Data is displayed
        })
        .catch((err) => {
          console.log(err);
          setIsDataDisplayed(false);
        });
      axios
        .post(baseURL + "/ShiftOperator/getTableTopDeatails", {
          NCId: selectedProgram?.Ncid,
        })
        .then((response) => {
          // console.log(response.data);
          setNewTableTopData(response.data);
        });
    } else {
      axios
        .post(baseURL + "/ShiftOperator/MachineTasksProfile", {
          NCId: selectedProgram?.Ncid,
        })
        .then((response) => {
          // console.log(response.data);
          setMachineTaskData(response.data);
          setIsDataDisplayed(true); // Data is displayed
        })
        .catch((err) => {
          console.log(err);
          setIsDataDisplayed(false);
        });
    }
  };

  let NCProgramNo = selectedProgram.NCProgramNo;

  useEffect(() => {
    setNcId(selectedProgram.Ncid);
  }, [selectedProgram.Ncid]);

  // console.log(selectedProgram);

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
    const dataCopy = [...getMachinetaskdata];
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

  //Format Time
  const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0 && mins === 0) {
      return "0 Hours 0 Min";
    }

    const hoursString = hours > 0 ? `${hours} Hours` : "";
    const minsString = mins > 0 ? `${mins} Min` : "";

    return `${hoursString} ${minsString}`.trim();
  };

  return (
    <>
      <GlobalModal
        show={open}
        title="magod_machine"
        content={
          <>
            Do you wish to load NC Program No: <strong>{NCProgramNo}</strong> ?
          </>
        }
        onYesClick={handleSubmit}
        onNoClick={handleClose}
        onClose={handleClose}
      />

      <div>
        <div
          className="col-md-12"
          style={{ overflowY: "scroll", overflowX: "scroll", height: "250px" }}
        >
          <Table striped className="table-data border">
            <thead className="tableHeaderBGColor table-space">
              <tr>
                <th onClick={() => requestSort("NCProgramNo")}>Program No</th>
                <th onClick={() => requestSort("TaskNo")}>Task No</th>
                <th onClick={() => requestSort("Operation")}>Operation</th>
                <th onClick={() => requestSort("Mtrl_Code")}>Material</th>
                <th onClick={() => requestSort("Qty")}>Quantity</th>
                <th onClick={() => requestSort("QtyAllotted")}>Allotted</th>
                <th onClick={() => requestSort("QtyCut")}>Process</th>
                <th onClick={() => requestSort("cust_name")}>Customer</th>
                <th onClick={() => requestSort("Remarks")}>Remarks</th>
              </tr>
            </thead>

            <tbody className="tablebody table-space">
              {sortedData().map((data, key) => (
                <tr
                  onClick={() => {
                    selectProgramFun(data, key);
                  }}
                  className={
                    key === selectedProgram?.index ? "selcted-row-clr" : ""
                  }
                  onDoubleClick={machinetask}
                  style={{ backgroundColor: data.rowColor }}
                >
                  <td>{data.NCProgramNo}</td>
                  <td>{data.TaskNo}</td>
                  <td>{data.Operation}</td>
                  <td>{data.Mtrl_Code}</td>
                  <td>{data.Qty}</td>
                  <td>{data.QtyAllotted}</td>
                  <td>{data.QtyCut}</td>
                  <td>{data.cust_name}</td>
                  <td>{data.Remarks}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>

      <div className="d-flex ">
        <div className="mt-1 col-md-5 ">
          <div
            style={{
              backgroundColor: "#d3d3d3",
              fontSize: "14px",
              height: "auto",
            }}
          >
            <div className="d-flex" style={{gap:'50px'}}>
              <div>
                <label className="form-label ms-1">Program Info</label>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  className="button-style mt-1  group-button"
                  onClick={openModal}
                >
                  Load Program
                </button>
              </div>
            </div>

            <div className="d-flex mt-3">
              <div style={{ textAlign: "left", fontSize: "12px" }}>
                <div
                  className=""
                  style={{ marginLeft: "10px", marginTop: "-18px" }}
                >
                  <label className="form-label" style={{ margin: 5 }}>
                    Program No :<b> {selectedProgram?.NCProgramNo} </b>
                  </label>
                </div>

                <div
                  className=""
                  style={{ marginLeft: "10px", marginTop: "-8px" }}
                >
                  <label className="form-label" style={{ margin: 5 }}>
                    Process : <b>{selectedProgram?.MProcess}</b>
                  </label>
                </div>

                <div
                  className=""
                  style={{ color: "", marginLeft: "10px", marginTop: "-8px" }}
                >
                  <label className="form-label" style={{ margin: 5 }}>
                    Operation :<b> {selectedProgram?.Operation} </b>
                  </label>
                </div>

                <div
                  className=""
                  style={{ color: "", marginLeft: "10px", marginTop: "-8px" }}
                >
                  <label className="form-label" style={{ margin: 5 }}>
                    To Process :<b> {selectedProgram?.Qty} </b>
                  </label>
                </div>

                <div
                  className="mb-1"
                  style={{ color: "", marginLeft: "10px", marginTop: "-8px" }}
                >
                  {" "}
                  <label className="form-label" style={{ margin: 5 }}>
                    Processed : <b> {selectedProgram?.QtyCut} </b>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-1 col-md-7 ms-1">
          <div
            style={{
              textAlign: "",
              backgroundColor: "#d3d3d3",
              fontSize: "14px",
              height: "auto",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <label className="form-label">Material Info</label>
            </div>

            <div
              style={{
                width: "auto",
                fontSize: "12px",
                marginLeft: "10px",
              }}
            >
              <div style={{ marginTop: "-10px" }}>
                {" "}
                <label className="form-label" style={{ margin: 5 }}>
                  Customer:
                  <b style={{ textAlign: "right" }}>
                    {" "}
                    {selectedProgram?.cust_name}{" "}
                  </b>{" "}
                </label>
              </div>

              <div
                className="d-flex"
                style={{ gap: "10px", marginTop: "-5px" }}
              >
                <div>
                  <label className="form-label" style={{ margin: 5 }}>
                    Code :
                    <b style={{ textAlign: "right" }}>
                      {" "}
                      {selectedProgram?.Cust_Code}
                    </b>
                  </label>
                </div>
                <div>
                  <label className="form-label" style={{ margin: 5 }}>
                    Source :
                    <b style={{ textAlign: "right" }}>
                      {" "}
                      {selectedProgram?.CustMtrl}
                    </b>
                  </label>
                </div>
              </div>

              <div
                className="d-flex"
                style={{ gap: "10px", marginTop: "-5px" }}
              >
                <div>
                  <label className="form-label" style={{ margin: 5 }}>
                    Length :{" "}
                    <b style={{ textAlign: "right" }}>
                      {" "}
                      {selectedProgram?.Para1}
                    </b>
                  </label>
                </div>
                <div>
                  <label className="form-label" style={{ margin: 5 }}>
                    Width :
                    <b style={{ textAlign: "right" }}>
                      {" "}
                      {selectedProgram?.Para2}
                    </b>
                  </label>
                </div>
              </div>

              {/* <div style={{ marginTop: "-5px" }}>
                <label className="form-label" style={{ margin: 5 }}>
                  Remarks :
                  <b style={{ textAlign: "right" }}>
                    {" "}
                    {selectedProgram?.Remarks}
                  </b>
                </label>
              </div> */}

              <div
                className="d-flex"
                style={{ gap: "10px", marginTop: "-5px" }}
              >
                <div>
                  <label className="form-label" style={{ margin: 5 }}>
                    Drawings :
                    <b style={{ textAlign: "right" }}>
                      {" "}
                      {selectedProgram?.NoOfDwgs}
                    </b>
                  </label>
                </div>
                <div>
                  <label className="form-label" style={{ margin: 5 }}>
                    Total Parts :
                    <b style={{ textAlign: "right" }}>
                      {" "}
                      {selectedProgram?.TotalParts}
                    </b>
                  </label>
                </div>
              </div>

              <div className="" style={{ marginTop: "-5px" }}>
                <label className="mb-4 form-label" style={{ margin: 5 }}>
                  Machine Time:{" "}
                  <b style={{ textAlign: "right" }}>
                    {convertMinutesToTime(selectedProgram?.ActualTime)}
                  </b>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasBOM === true ? (
        <MachineTaskService
          machineTaskService={machineTaskService}
          servicetopData={newTableTopData}
        />
      ) : (
        <MachineTaskProfile
          selectedProgram={selectedProgram}
          machineTaskData={machineTaskData}
          machinetask={machinetask}
          setIsDataDisplayed={setIsDataDisplayed}
        />
      )}

      <ErrorModal
        ErrorshowModal={ErrorshowModal}
        setErrorshowModal={setErrorshowModal}
      />
    </>
  );
}
