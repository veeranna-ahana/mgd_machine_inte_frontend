import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import ShowUsedModal from "./ShowUsedModal";
import AllModal from "../ProductionReportTab/MaterialUsageTab/AllModal";
import ShowAllModal from "./ShowAllModal";
import MarkAsUsedModal from "./MarkAsUsedModal";
import axios from "axios";
import { baseURL } from "../../../../../api/baseUrl";
import { toast } from "react-toastify";
import { uncountability } from "i/lib/methods";
import MarkAsRejected from "./MarkAsRejected";
import { useGlobalContext } from "../../../../../Context/Context";
import ProgramPartsTabModal from "./ProgramPartsTabModal";

export default function ProgrmMatrlTableProfile({
  afterloadProgram,
  setAfterloadProgram,
  showTable,
  selectedMtrlTable,
  rowSelectMtrlTable,
  setSelectedMtrlTable,
  selectedMachine,
  ProgramNo,
  getmiddleTbaleData,
  selectshifttable,
  setMachinetaskdata,
}) {
  const {
    afterRefreshData,
    setAfterRefreshData,
    NcId,
    formdata,
    setProgramPartsData,
    setFormData,
    tubeCuttingModal,
    setTubeCuttingModal,setShiftLogDetails
  } = useGlobalContext();

  const [showusedModal, setShowusedModal] = useState(false);
  const [allModal, setAllModal] = useState(false);
  const [isCheckboxchecked, setIsCheckboxchecked] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [isDataFiltered, setIsDataFiltered] = useState(false);

  const filterUnusedData = () => {
    // Filter the ProductionReportData array to show only rows where Used and Rejected are both 0
    const filteredData = afterRefreshData.filter(
      (data) => data.Used === 0 && data.Rejected === 0
    );
    setOriginalData(afterRefreshData); // Save the original data
    setAfterRefreshData(filteredData); // Update the filtered data
    setIsDataFiltered(true); // Set the flag to indicate data is filtered
    setSelectedMtrlTable([]);
  };

  const resetData = () => {
    setAfterRefreshData(originalData); // Restore the original data
    setIsDataFiltered(false); // Clear the data filtered flag
  };

  const handleCheckBoxChange = () => {
    const newCheckedState = !isCheckboxchecked;
    setIsCheckboxchecked(newCheckedState);

    if (newCheckedState) {
      setShowusedModal(true);
    } else {
      setAllModal(true);
    }
  };

  const [MarkasUsed, setMarkasUsed] = useState(false);
  const [MarkasReject, setMarkasReject] = useState(false);

  const handleMarkasUsedModal = () => {
    // Check if no material is selected
    if (selectedMtrlTable.length === 0) {
      toast.error("Please select material", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    } else {
      // Check if any material is already used or rejected
      const isAnyUsedOrRejected = selectedMtrlTable.some(
        (item) => item.Used === 1 || item.Rejected === 1
      );

      if (isAnyUsedOrRejected) {
        toast.error(
          "Once material is used or rejected, it cannot be used again",
          {
            position: toast.POSITION.TOP_CENTER,
          }
        );
      } else {
        setMarkasUsed(true);
      }
    }
  };

  const handleMarkasRejected = () => {
     // Check if no material is selected
     if (selectedMtrlTable.length === 0) {
      toast.error("Please select material", {
        position: toast.POSITION.TOP_CENTER,
      });
      return;
    }
    else{
      const isAnyUsedOrRejected = selectedMtrlTable.some(
        (item) => item.Used === 1 || item.Rejected === 1
      );
  
      if (isAnyUsedOrRejected) {
        toast.error("Once material used or Rejected Cannot be used again", {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setMarkasReject(true);
      }
    }
  };

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
      });
  };

  useEffect(() => {
    getMachineTaskAfterMU();
  }, []);

  const handleMarkasUsed = () => {
    const isTubeCutting = formdata.Operation.toLowerCase().includes(
      "tube cutting".toLowerCase()
    );
    // if(isTubeCutting && selectedMtrlTable.length !== afterRefreshData.length){
    //   toast.error("Please Select ALL for tube Cutting", {
    //     position: toast.POSITION.TOP_CENTER,
    //   });
    // }
    // else{
    axios
      .post(baseURL + "/ShiftOperator/markAsUsedProgramMaterial", {
        selectedMtrlTable: selectedMtrlTable,
        selectedMachine: selectedMachine,
        formdata,
      })
      .then(() => {
        axios
          .post(baseURL + "/ShiftOperator/getprogramParts", {
            NcId: formdata?.Ncid,
          })
          .then((response) => {
            // console.log("excuted data")
            setProgramPartsData(response.data);
          });
        setSelectedMtrlTable([]);
      })
      .then(() => {
        // Fetch data after marking as used
        axios
          .post(baseURL + "/ShiftOperator/getdatafatermarkasUsedorRejected", {
            NCProgramNo: ProgramNo,
          })
          .then((response) => {
            setIsCheckboxchecked(false); // Clear the data filtered flag
            // console.log("required result", response.data);
            setAfterRefreshData(response?.data);
            if (!response.data) {
              setAfterRefreshData([]);
            }
          });

        axios
          .post(baseURL + "/ShiftOperator/updateformafterMarkasUsed", {
            NcId: formdata?.Ncid,
          })
          .then((response) => {
            setFormData(response.data[0]);
          });
      })
      .then(() => {
        // Show success toast
        toast.success("Success", {
          position: toast.POSITION.TOP_CENTER,
        });
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
            // console.log(null);
          }
          return item;
        });
           console.log("updated data",updatedData);
        // Update the state with the modified data
        setShiftLogDetails(updatedData);
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
        getMachineTaskAfterMU();
      })
      .catch((err) => {
        console.error(err);
      });
    if (isTubeCutting) {
      setTubeCuttingModal(true);
    }
  };

  const [RejectedReasonState, setRejectedReasonState] = useState({});

  const onChangeInput = (key, e) => {
    const { value } = e.target;
    setRejectedReasonState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  // Get only the values from RejectedReasonState
  const valuesArray = Object.values(RejectedReasonState);

  // Concatenate the values into a single string
  const newReason = valuesArray.join(" "); // Change the separator as needed

  const UpdateRejectReason = () => {
    if (
      !Object.values(RejectedReasonState).some((reason) => reason.trim() !== "")
    ) {
      toast.error("Rejected Reason is empty", {
        position: toast.POSITION.TOP_CENTER,
      });
      return; // Prevent further execution if the reason is empty
    } else {
      axios
        .post(baseURL + "/ShiftOperator/markAsRejectedProgramMaterial", {
          selectedMtrlTable,
          RejectedReason: RejectedReasonState,
        })
        .then((response) => {
          toast.success("Rejected Reason Saved", {
            position: toast.POSITION.TOP_CENTER,
          });
          setRejectedReasonState({});
          setSelectedMtrlTable([]);
          // setIsCheckboxchecked(false);
          axios
            .post(baseURL + "/ShiftOperator/getdatafatermarkasUsedorRejected", {
              NCProgramNo: ProgramNo,
            })
            .then((response) => {
              setIsCheckboxchecked(false);
              setAfterRefreshData(response?.data);
              if (!response.data) {
                setAfterRefreshData([]);
              }
            });
          getMachineTaskAfterMU();
        })
        .catch((error) => {
          toast.error("An error occurred while updating reject reason", {
            position: toast.POSITION.TOP_CENTER,
          });
        });
    }
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
    const dataCopy = [...afterRefreshData];
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
      selectedMtrlTable.length === afterRefreshData.length;
    setSelectedMtrlTable(allRowsSelected ? [] : afterRefreshData);
  };

  return (
    <div>
      {showTable ? (
        <div className="" style={{ marginTop: "-10px" }}>
          <div className="col-md-12 col-sm-12">
            <div className="form-bg">
              <div className="row">
                <div style={{ textAlign: "center" }} className="col-md-4">
                  <div>
                    <button
                      className="button-style group-button mb-1"
                      onClick={handleMarkasUsedModal}
                    >
                      Mark as Used
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: "center" }} className="col-md-5">
                  <div>
                    <button
                      className="button-style group-button mb-1"
                      onClick={handleMarkasRejected}
                    >
                      Mark as Rejected
                    </button>
                  </div>
                </div>

                <div className="col-md-2 row">
                  <input
                    type="checkbox"
                    className="col-md-4"
                    checked={isCheckboxchecked}
                    onChange={handleCheckBoxChange}
                    style={{ marginLeft: "-20px" }}
                  />
                  <label
                    className="form-label col-md-1 mt-1"
                    style={{ whiteSpace: "nowrap", marginLeft: "-10px" }}
                  >
                    Show unused
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {showTable ? (
        <div
          className="mt-1 col-md-12 col-sm-12"
          style={{ overflow: "scroll", height: "230px" }}
        >
          <Table striped className="table-data border">
            <thead
              className="tableHeaderBGColor table-space"
              style={{ fontSize: "13px" }}
            >
              <tr>
                <th onClick={handleSelectAll}></th>
                <th onClick={() => requestSort("ShapeMtrlID")}>Material ID</th>
                <th onClick={() => requestSort("Para1")}>Width</th>
                <th onClick={() => requestSort("Para2")}>Length</th>
                <th onClick={() => requestSort("Used")}>Used</th>
                <th onClick={() => requestSort("Rejected")}>Rejected</th>
                <th onClick={() => requestSort("RejectionReason")}>
                  Rejection Reason
                </th>
              </tr>
            </thead>

            <tbody
              className="tablebody table-space"
              style={{ fontSize: "12px" }}
            >
              {sortedData()?.map((data, key) => (
                <tr
                  onClick={() => {
                    rowSelectMtrlTable(data, key);
                  }}
                  className={
                    selectedMtrlTable.includes(data) ? "selcted-row-clr" : ""
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
                            : RejectedReasonState[data.NcPgmMtrlId] || ""
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
      <div>
        <ShowUsedModal
          showusedModal={showusedModal}
          setShowusedModal={setShowusedModal}
          filterUnusedData={filterUnusedData}
        />

        <ShowAllModal
          allModal={allModal}
          setAllModal={setAllModal}
          resetData={resetData}
        />

        <MarkAsUsedModal
          MarkasUsed={MarkasUsed}
          setMarkasUsed={setMarkasUsed}
          handleMarkasUsed={handleMarkasUsed}
        />

        <MarkAsRejected
          MarkasReject={MarkasReject}
          setMarkasReject={setMarkasReject}
          handleMarkasRejected={UpdateRejectReason}
        />

        <ProgramPartsTabModal />
      </div>
    </div>
  );
}
