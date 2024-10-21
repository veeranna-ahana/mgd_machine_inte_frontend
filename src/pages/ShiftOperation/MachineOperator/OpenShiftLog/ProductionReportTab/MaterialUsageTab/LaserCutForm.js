import React, { useState, useEffect, useMemo } from "react";
import { Table } from "react-bootstrap";
import MarkasRejectedModal from "./MarkasUsedModal";
import RowRejectedModal from "./RowRejectedModal";
import ShowUnusedModal from "./ShowUnusedModal";
import AllModal from "./AllModal";
import axios from "axios";
import { baseURL } from "../../../../../../api/baseUrl";
import { toast } from "react-toastify";
import RejectModal from "./RejectModal";
import MarkasUsedModal from "./MarkasUsedModal";
import { useGlobalContext } from "../../../../../../Context/Context";
// import AltModal from '../../../AltModal';

export default function LaserCutForm({
  selectProductionReport,
  openTable,
  selectshifttable,
  setMachinetaskdata,
  setComplete,
}) {
  const { NcId, partDetailsData, setPartDetailsData,setShiftLogDetails } = useGlobalContext();

  //  const[showModal,setShowModal]=useState(false);
  const [markasUsed, setMarkasUsed] = useState(false);
  const [rowsRejected, setRowsRejected] = useState(false);
  const [isCheckboxchecked, setIsCheckboxchecked] = useState(false);


  const [openModal, setOpenModal] = useState(false);

  let Machine = selectshifttable?.Machine;
  const getMachineTaskAfterMU = () => {
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
          } else if (response.data[i].Remarks !== "") {
            response.data[i].rowColor = "#DC143C";
          }
        }
        setMachinetaskdata(response.data);
        // console.log("response after mark as used",response.data);
      });
  };

  useEffect(() => {
    getMachineTaskAfterMU();
  }, []);

  // Multiple Row Select Function for Table
  const [selectdefaultRow, setSelectdefaultRow] = useState([]);
  const initialRowSelection = (item, index) => {
    // let list = { ...item, index: index };
    // setSelectedMtrlTable(list);
    const selectedRowData = ProductionReportData[index];
    const isSelected = selectdefaultRow.some((row) => row === selectedRowData);
    if (isSelected) {
      setSelectdefaultRow(
        selectdefaultRow.filter((row) => row !== selectedRowData)
      );
    } else {
      setSelectdefaultRow([...selectdefaultRow, selectedRowData]);
    }
  };

  const handleRejectModal = () => {
    if (selectdefaultRow.length === 0) {
      toast.error("Please select material", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    else{
      const isAnyUsedOrRejected = selectdefaultRow.some(
        (item) => item.Used === 1 || item.Rejected === 1
      );
      if (isAnyUsedOrRejected) {
        toast.error("Once material used or Rejected Cannot be used again", {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setRowsRejected(true);
      }
    }
  };

  const handlemarkasUsed = () => {
    if (selectdefaultRow.length === 0) {
      toast.error("Please select material", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    else{
      const isAnyUsedOrRejected = selectdefaultRow.some(
        (item) => item.Used === 1 || item.Rejected === 1
      );
      if (isAnyUsedOrRejected) {
        toast.error("Once material used or Rejected Cannot be used again", {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setMarkasUsed(true);
      }
    }
  };

  // console.log("Laser Data", selectProductionReport);

  const selectProductionReportData = selectProductionReport?.Ncid;
  const [showUnused, setShowUnused] = useState(false);
  const [ProductionReportData, setProductionReportData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [allModal, setAllModal] = useState(false);
  const [checked, setChecked] = useState(false);

  const [isDataFiltered, setIsDataFiltered] = useState(false);

  const filterUnusedData = () => {
    const filteredData = ProductionReportData.filter((data) => data.Used === 0 && data.Rejected===0);
    setOriginalData(ProductionReportData); // Save the original data
    setProductionReportData(filteredData); // Update the filtered data
    setIsDataFiltered(true); // Set the flag to indicate data is filtered
    setSelectdefaultRow([])
  };

  const resetData = () => {
    setProductionReportData(originalData); // Restore the original data
    setIsDataFiltered(false); // Clear the data filtered flag
  };

  const handleCheckBox = () => {
    // setChecked(!checked);
    // if (checked) {
    //   setAllModal(true);
    // } else {
    //   setShowUnused(true);
    // }

    const newCheckedState = !isCheckboxchecked;
    setIsCheckboxchecked(newCheckedState);

    if (newCheckedState) {
      setShowUnused(true);
    } else {
      setAllModal(true);
    }
  };

  const MaterialUsage = () => {
    axios
      .post(baseURL + "/ShiftOperator/MachineTasksProfile", {
        NCId: selectProductionReportData,
      })
      .then((response) => {
        setProductionReportData(response.data);
        const data = response.data;
        let count = 0;

        // Iterate through each object in the response data
        data.forEach((item) => {
          // Check if Used or Rejected is zero
          if ((item.Used === 1 || item.Rejected === 1) || (item.QtyUsed === 1 || item.QtyReturned)) {
            count++;
          }
        });

        // Output the count
// 

        if (count === selectProductionReport.QtyAllotted) {
          // console.log("conditon 1")
          setComplete(true);
        } else {
          // console.log("conditon 2")
          setComplete(false);
        }

        // If count is greater than 0, another row is incremented
        if (count > 0) {
          // Increment another row
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  useEffect(() => {
    MaterialUsage();
  }, [selectProductionReport]);

  // console.log("selectdefaultRow",selectdefaultRow)

  //Mark as Used Button
  const handleMarkasUsed = () => {
    // const isTubeCutting = selectProductionReport.Operation.toLowerCase().includes('tube cutting'.toLowerCase());

    // if(isTubeCutting && ProductionReportData.length !== selectdefaultRow.length){
    //   toast.error("Please Select ALL for tube Cutting", {
    //     position: toast.POSITION.TOP_CENTER,
    //   });
    // }
    // else{
      axios
      .post(baseURL + "/ShiftOperator/markAsUsedProductionReport", {
        selectdefaultRow,
        selectedMachine: selectshifttable?.Machine,
        selectProductionReport
      })
      .then((response) => {
        axios
          .post(baseURL + "/ShiftOperator/getpartDetails", {
            selectProductionReport,
          })
          .then((response) => {
            // console.log("excuted data refresh func");
            setPartDetailsData(response.data);
            setIsCheckboxchecked(false);    
             toast.success("success", {
          position: toast.POSITION.TOP_CENTER,
        });          
          });
        getMachineTaskAfterMU();
        axios
          .post(baseURL + "/ShiftOperator/MachineTasksProfile", {
            NCId: selectProductionReportData,
          })
          .then((response) => {
            setProductionReportData(response.data);
            const data = response.data;
            let count = 0;

            // Iterate through each object in the response data
            data.forEach((item) => {
              // Check if Used or Rejected is zero
              if ((item.Used === 1 || item.Rejected === 1) || (item.QtyUsed === 1 || item.QtyReturned)) {
                count++;
              }
            });

            // If count equals selectProductionReport.Qty, setComplete(true)
            if (count === selectProductionReport.QtyAllotted) {
              // console.log("conditon 1")
              setComplete(true);
            } else {
              // console.log("conditon 2")
              setComplete(false);
            }

            // If count is greater than 0, another row is incremented
            if (count > 0) {
              // Increment another row
            }
          });
        MaterialUsage();
        getMachineTaskAfterMU();
      })
      .catch((err) => {
        console.log(err);
      });
    // }
     
  };

  useEffect(() => {
    const data = ProductionReportData;
    let count = 0;
     // Iterate through each object in the response data
     data.forEach((item) => {
      // Check if Used or Rejected is equal to 1, or if QtyUsed is equal to 1 or QtyReturned is true
       if ((item.Used === 1 || item.Rejected === 1) || (item.QtyUsed === 1 || item.QtyReturned)) {
         count++;
       }
     });
     // If count equals selectProductionReport.Qty, setComplete(true)
     if (count === selectProductionReport.QtyAllotted) {
       setComplete(true);
     } else {
       setComplete(false);
     }
     MaterialUsage();
  }, []);

  //mark as Reject
  const [RejecteReason, setRejectReason] = useState({});
  const onChangeInput = (key, e) => {
    const { value } = e.target;
    setRejectReason((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  const valueSepertor = Object.values(RejecteReason);
  const newReason = valueSepertor.join(" ");
  const UpdateRejectedReason = () => {
    if (!Object.values(RejecteReason).some((reason) => reason.trim() !== "")) {
      toast.error("Rejected Reason is empty", {
        position: toast.POSITION.TOP_CENTER,
      });
      return; // Prevent further execution if the reason is empty
    }
    axios
      .post(baseURL + "/ShiftOperator/markAsRejectedProductionReport", {
        selectdefaultRow,
        RejectedReason: RejecteReason,
      })
      .then(() => {
        toast.success("Rejected Reason Saved", {
          position: toast.POSITION.TOP_CENTER,
        });
        MaterialUsage();
        getMachineTaskAfterMU();
        setIsCheckboxchecked(false);              
      })
      .catch((err) => {
        toast.error("An error occurred while updating reject reason", {
          position: toast.POSITION.TOP_CENTER,
        });
      });
  };

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
    const dataCopy = [...ProductionReportData];
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

  // Add a state variable to track whether all rows are selected
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    const allRowsSelected =
      selectdefaultRow.length === ProductionReportData.length;
    setSelectdefaultRow(allRowsSelected ? [] : ProductionReportData);
  };

  return (
    <div>
      <div className="">
        {openTable ? (
          <div className="col-md-12 col-sm-12">
            <div className="ip-box form-bg ">
              <div className="row" style={{ gap: "10px", marginLeft: "-5px" }}>
                <div
                  style={{ textAlign: "center", marginLeft: "-12px" }}
                  className="col-md-3"
                >
                  <div>
                    <button
                      className="button-style group-button mb-1"
                      style={{ width: "100px" }}
                      onClick={handlemarkasUsed}
                    >
                      Mark as Used
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "center" }} className="col-md-4">
                  <div>
                    <button
                      className="button-style group-button"
                      style={{ width: "110px" }}
                      onClick={handleRejectModal}
                    >
                      Mark as Rejected
                    </button>
                  </div>
                </div>

                <div className="col-md-3 row">
                  <input
                    type="checkbox"
                    className="col-md-2"
                    checked={isCheckboxchecked}
                    onChange={handleCheckBox}
                  />
                  <label
                    className="form-label col-md-1 mt-1"
                    style={{ whiteSpace: "nowrap", marginLeft: "-6px" }}
                  >
                    <b>show unused</b>
                  </label>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="col-md-12">
        {openTable ? (
          <div
            style={{
              overflowY: "scroll",
              overflowX: "scroll",
              height: "250px",
            }}
          >
            <Table striped className="table-data border">
              <thead
                className="tableHeaderBGColor table-space"
                style={{ fontSize: "12px" }}
              >
                <tr>
                  <th onClick={handleSelectAll}></th>
                  <th onClick={() => requestSort("ShapeMtrlID")}>
                    Material Id
                  </th>
                  <th onClick={() => requestSort("Para2")}>width</th>
                  <th onClick={() => requestSort("Para1")}>Length</th>
                  <th onClick={() => requestSort("Used")}>Used</th>
                  <th onClick={() => requestSort("ShapeRejectedtrlID")}>
                    Rejected
                  </th>
                  <th onClick={() => requestSort("RejectionReason")}>
                    Rejection Reason
                  </th>
                </tr>
              </thead>
              <tbody className="tablebody table-space">
                {sortedData()?.map((data, key) => (
                  <tr
                    onClick={() => {
                      initialRowSelection(data, key);
                    }}
                    className={
                      selectdefaultRow.includes(data) ? "selcted-row-clr" : ""
                    }
                  >
                    <td></td>
                    <td>{data.ShapeMtrlID}</td>
                    <td>{data.Para1}</td>
                    <td>{data.Para2}</td>
                    <td>
                      <input type="checkbox" checked={data.Used === 1} />
                    </td>
                    <td>
                      <input type="checkbox" checked={data.Rejected === 1} />
                    </td>

                    <td>
                      <div key={data.index}>
                        <input
                          className="table-cell-editor"
                          style={{ textAlign: "center", width: "150px" }}
                          value={
                            data.Rejected === 1
                              ? data.RejectionReason
                              : RejecteReason[data.NcPgmMtrlId] || ""
                          }
                          readOnly={data.Rejected === 1}
                          onChange={(e) => onChangeInput(data.NcPgmMtrlId, e)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : null}
      </div>

      <MarkasUsedModal
        markasUsed={markasUsed}
        setMarkasUsed={setMarkasUsed}
        handleMarkasUsed={handleMarkasUsed}
        selectProductionReportData={selectProductionReportData}
        setProductionReportData={setProductionReportData}
        setSelectdefaultRow={setSelectdefaultRow}
        selectProductionReport={selectProductionReport}
        setComplete={setComplete}
      />

      <RowRejectedModal
        rowsRejected={rowsRejected}
        setRowsRejected={setRowsRejected}
      />

      <ShowUnusedModal
        showUnused={showUnused}
        setShowUnused={setShowUnused}
        filterUnusedData={filterUnusedData}
      />

      <RejectModal
        rowsRejected={rowsRejected}
        setRowsRejected={setRowsRejected}
        handleRejectedRow={UpdateRejectedReason}
        setSelectdefaultRow={setSelectdefaultRow}
        setRejectReason={setRejectReason}
      />

      <AllModal
        allModal={allModal}
        setAllModal={setAllModal}
        resetData={resetData}
      />
    </div>
  );
}
