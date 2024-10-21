import React, { useEffect, useState } from "react";
import MaterialAndPartsTabs from "./MaterialAndPartsTabs";
import { Table } from "react-bootstrap";
import LoadProgramInfoModal from "./LoadProgramInfoModal";
import ProgramCompleteModal from "./ProgramCompleteModal";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useGlobalContext } from "../../../../../Context/Context";
import { baseURL } from "../../../../../api/baseUrl";
import axios from "axios";

export default function ProgramInfoForms({
  getMachinetaskdata,
  selectshifttable,
  getMachineTaskData,
  setMachinetaskdata,
}) {
  const { setHasBOM, shiftSelected,formdata,servicedata, setService } = useGlobalContext();
  const [loadProgramInfo, setloadProgramInfo] = useState(false);
  const [programComplete, setProgramComplete] = useState(false);
  const [complete, setComplete] = useState(false);


  const [selectProductionReport, setSelectProductionReport] = useState({});
  const selectProductionReportFun = (item, index) => {
    let list = { ...item, index: index };
    setSelectProductionReport(list);
    axios
      .post(baseURL + "/ShiftOperator/checkhasBOM", {
        NCId: list?.Ncid,
      })
      .then((response) => {
        // console.log(response.data);
        setHasBOM(response.data);
      });
    setOpenTable(false);
  };


  //Load Program
  const [rpTopData, setRptTopData] = useState([]);
  const [openTable, setOpenTable] = useState(false);
  const handleButtonClick = () => {
    axios
    .post(baseURL + "/ShiftOperator/MachineTasksService", {
      NCId: selectProductionReport.Ncid,
    })
    .then((response) => {
      setService(response.data);
    })
    axios
      .post(baseURL + "/ShiftOperator/getTableTopDeatails", {
        NCId: selectProductionReport?.Ncid,
      })
      .then((response) => {
        setRptTopData(response.data);
        const data = response.data;
                  let count = 0;
                  let Qty = 0;


                  // Iterate through each object in the response data
                  data.forEach((item) => {
                    // Check if Used or Rejected is equal to 1, or if QtyUsed is equal to 1 or QtyReturned is true
                    if (selectProductionReport.HasBOM === 1) {
                      count = item.QtyUsed + item.QtyReturned;
                      Qty = item?.QtyIssued;
                    }
                  });

                  // If count equals selectProductionReport.Qty, setComplete(true)
                  if (count === Qty) {
                    setComplete(true);
                  } else {
                    setComplete(false);
                  }

      });
          // console.log(selectProductionReport.Ncid, newNcid);
          if (selectProductionReport.NCProgramNo === formdata?.NCProgramNo) {
            toast.error(
              "Program Currently Being Processed, Use Current Program Window To Update Values",
              {
                position: toast.POSITION.TOP_CENTER,
              }
            );
          } else {
            setOpenTable(true);
        } 
  };

  const handleSubmit = () => {
    setloadProgramInfo(true);
  };

  // useEffect(() => {
  //   // Check if selectProductionReport exists before making the request
  //   if (selectProductionReport) {
  //     axios
  //       .post(baseURL + "/ShiftOperator/getQtydata", {
  //         selectProductionReport,
  //       })
  //       .then((response) => {
  //         console.log(response.data);
  //         // Further processing of response data if needed
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching quantity data:", error);
  //       });
  //   }
  // }, [selectProductionReport]);

  // console.log("selectProductionReport",selectProductionReport);

  //mark as Completed
  const programCompleteSubmit = async () => {
    console.log("complete is",complete);
    try {
      const response = await axios.post(baseURL + "/ShiftOperator/getNCId", {
        shiftSelected,
      });

      if (response.data && response.data.length > 0) {
        const newNcid = response.data[0].Ncid;

        if (selectProductionReport.Ncid === newNcid) {
          toast.error(
            "Program Currently Being Processed, Use Current Program Window To Update Values",
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
          return; // Exit the function early if program is currently being processed
        }
      }

      // If matching object is found and QtyCut is less than Qty, show an error toast
      if (complete === false) {
        toast.error(
          "Either mark the material allotted as used or rejected before changing status to completed",
          {
            position: toast.POSITION.TOP_CENTER,
          }
        );
        return;
      }

      // // If QtyCut is less than Qty, show an error toast
      // if (selectProductionReport.QtyCut < selectProductionReport.Qty) {
      //   toast.error(
      //     "Either mark the material allotted as used or rejected before changing status to completed",
      //     {
      //       position: toast.POSITION.TOP_CENTER,
      //     }
      //   );
      //   return;
      // }
      else {
        setProgramComplete(true);
      }
    } catch (error) {
      // Handle error if the request fails
    }
  };

  useEffect(() => {
    if (getMachinetaskdata.length > 0 && !selectProductionReport.NCProgramNo) {
      selectProductionReportFun(getMachinetaskdata[0], 0); // Select the first row
    }
  }, [getMachinetaskdata, selectProductionReport, selectProductionReportFun]);


  const handleRefresh = () => {
    setOpenTable(false);
    if (getMachinetaskdata.length > 0) {
      selectProductionReportFun(getMachinetaskdata[0], 0);
    }
  };

  // console.log(selectProductionReport,"selectProductionReport is ")

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

  //Time Conversion
  const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
  
    const hoursString = `${hours} Hours`;
    const minsString = `${mins} Min`;
  
    return `${hoursString} ${minsString}`;
  };

  return (
    <div>
      <div
        className="col-md-12"
        style={{ overflowY: "scroll", overflowX: "scroll", height: "250px" }}
      >
        <Table striped className="table-data border table-space">
          <thead className="tableHeaderBGColor">
            <tr>
              <th onClick={() => requestSort("NCProgramNo")}>Program No</th>
              <th onClick={() => requestSort("TaskNo")}>Task No</th>
              <th onClick={() => requestSort("cust_name")}>Customer</th>
            </tr>
          </thead>

          <tbody className="tablebody table-space" style={{ fontSize: "13px" }}>
            {sortedData().map((item, key) => {
              return (
                <>
                  <tr
                    onClick={() => {
                      selectProductionReportFun(item, key);
                    }}
                    className={
                      key === selectProductionReport?.index
                        ? "selcted-row-clr"
                        : ""
                    }
                  >
                    <td>{item.NCProgramNo}</td>
                    <td>{item.TaskNo}</td>
                    <td>{item.cust_name}</td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </Table>
      </div>

      <div className="row">
        <div className=" col-md-5">
          <div
            style={{
              backgroundColor: "#d3d3d3",
              marginTop: "2px",
              marginLeft: "-12px",
              fontSize: "12px",
              height: "auto",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <label className="form-label">Process Info</label>
            </div>

            <div style={{ marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Program No : <b>{selectProductionReport?.NCProgramNo}</b>
              </label>
            </div>

            <div style={{ marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Process : <b>{selectProductionReport?.MProcess} </b>
              </label>
            </div>
            <div style={{ marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Operation : <b> {selectProductionReport?.Operation} </b>
              </label>
            </div>

            <div className="d-flex" style={{ marginLeft: "10px", marginTop: "-5px", gap:'30px' }}>
              <label className="form-label">
                {" "}
                To Process : <b> {selectProductionReport?.Qty} </b>
              </label>
              <label className="form-label">
                Allotted :<b> {selectProductionReport?.QtyAllotted}</b>
              </label>
            </div>
            {/* <div style={{ marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Allotted :<b> {selectProductionReport?.QtyAllotted}</b>
              </label>
            </div> */}

            <div style={{ marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Processed : <b> {selectProductionReport?.QtyCut}</b>
              </label>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div
            style={{
              backgroundColor: "#d3d3d3",
              marginTop: "2px",
              marginLeft: "-12px",
              fontSize: "12px",
              height: "auto",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <label className="form-label">Production Info</label>
            </div>

            <div style={{ marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Customer :<b> {selectProductionReport?.cust_name} </b>
              </label>
            </div>

            <div style={{ marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Material :<b> {selectProductionReport?.Mtrl_Code}</b>
              </label>
            </div>
            <div className="d-flex" style={{ marginLeft: "10px", gap:'30px', marginTop: "-5px" }}>
              <div>
                <label className="form-label">
                  Drawings :<b> {selectProductionReport?.NoOfDwgs} </b>
                </label>
              </div>
              <div>
                <label className="form-label">
                  Total Parts :<b>{selectProductionReport?.TotalParts}</b>
                </label>
              </div>
            </div>
            <div style={{ marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Planned Time :
                <b>
                  {convertMinutesToTime(selectProductionReport?.EstimatedTime)}{" "}
                </b>
              </label>
            </div>

            <div style={{ color: "", marginLeft: "10px", marginTop: "-5px" }}>
              <label className="form-label">
                Actual Time :
                <b>
                  {convertMinutesToTime(selectProductionReport?.ActualTime)}{" "}
                </b>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div style={{ textAlign: "", marginLeft: "0px" }} className="col-md-6">
          <div>
            <button
              className="button-style group-button"
              onClick={handleButtonClick}
            >
              Load Program Info
            </button>
          </div>
        </div>

        <div style={{ textAlign: "", marginLeft: "0px" }} className="col-md-4">
          <div>
            <button
              className="button-style group-button"
              style={{ marginLeft: "-70px" }}
              onClick={programCompleteSubmit}
            >
              Program complete
            </button>
          </div>
        </div>

        <div style={{ textAlign: "", marginLeft: "0px" }} className="col-md-2">
          <div>
            <button
              className="button-style group-button mb-1"
              style={{ marginLeft: "-60px" }}
              onClick={handleRefresh}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <MaterialAndPartsTabs
        selectProductionReport={selectProductionReport}
        openTable={openTable}
        selectshifttable={selectshifttable}
        rpTopData={rpTopData}
        setRptTopData={setRptTopData}
        setMachinetaskdata={setMachinetaskdata}
        setComplete={setComplete}
      />

      <LoadProgramInfoModal
        loadProgramInfo={loadProgramInfo}
        setloadProgramInfo={setloadProgramInfo}
      />

      <ProgramCompleteModal
        programComplete={programComplete}
        setProgramComplete={setProgramComplete}
        selectProductionReport={selectProductionReport}
        getMachineTaskData={getMachineTaskData}
        setOpenTable={setOpenTable}
        getMachinetaskdata={getMachinetaskdata}
        setSelectProductionReport={setSelectProductionReport}
      />
    </div>
  );
}
