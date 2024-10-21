import React, { useMemo, useState } from "react";
import ProgramMtrlTableProfile from "./ProgramMtrlTableProfile";
import { useGlobalContext } from "../../../../../Context/Context";
import GlobalModal from "../../GlobalModal";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { baseURL } from "../../../../../api/baseUrl";
import axios from "axios";
import ProgrmMatrlTableService from "./ProgrmMatrlTableService";
import { useEffect } from "react";

export default function Form1({
  afterloadProgram,
  showTable,
  setAfterloadProgram,
  selectedMachine,
  getMachineShiftStatusForm,
  selectshifttable,
  getmiddleTbaleData,
  setMachinetaskdata,
}) {
  const {
    afterRefreshData,
    setAfterRefreshData,
    formdata,
    setFormData,
    hasBOM,
    machineTaskService,
    pgmNo,
    setPgmNo,
    timeDiffInMinutes,
    setTimeDiffInMinutes,
  } = useGlobalContext();
  const [mismatchModal, setmismatchModal] = useState(false);
  const [loadProgram, setLoadProgram] = useState(false);

  const handleSubmit = () => {
    setmismatchModal(true);
  };

  const handleClose = () => {
    setLoadProgram(false);
    setmismatchModal(false);
  };

  useEffect(() => {
    getmiddleTbaleData();
  }, []);

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

  //selecting table
  const [selectedMtrlTable, setSelectedMtrlTable] = useState([]);

  const rowSelectMtrlTable = (item, index) => {
    const selectedRowData = afterRefreshData[index];
    const isSelected = selectedMtrlTable.includes(selectedRowData);
    if (isSelected) {
      // If the row is already selected, remove it from the selection
      setSelectedMtrlTable(
        selectedMtrlTable.filter((row) => row !== selectedRowData)
      );
    } else {
      // If the row is not selected, add it to the selection
      setSelectedMtrlTable([...selectedMtrlTable, selectedRowData]);
    }
  };

  let ProgramNo = formdata?.NCProgramNo;
  const loadProgramSubmit = () => {
    // console.log(selectedMtrlTable);
    if (selectedMtrlTable.length < 1) {
      toast.error("Please Select a Material", {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      if (selectedMtrlTable[0].Used === 1 || selectedMtrlTable[0].Rejected === 1) {
        toast.error("Cannot Load the Material that is Used or Rejected", {
          position: toast.POSITION.TOP_CENTER,
        });
      } else {
        setLoadProgram(true);
      }
    }
  };

  // console.log("selectedMtrlTable is",selectedMtrlTable)

  const onclickofYes = () => {
    axios
      .post(baseURL + "/ShiftOperator/loadMaterial", {
        selectedMtrlTable,
        MachineName: selectedMachine,
      })
      .then((response) => {
        toast.success("Material Loaded Successfully", {
          position: toast.POSITION.TOP_CENTER,
        });
      });
    setLoadProgram(false);
    getMachineShiftStatusForm();
    // setSelectedMtrlTable([]);
  };

  // Utility function to convert minutes to "hh:mm" format
  const convertMinutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0 && mins === 0) {
      return "0 Hrs 0 Min";
    }

    const hoursString = hours > 0 ? `${hours} Hrs` : "";
    const minsString = mins > 0 ? `${mins} Min` : "";

    return `${hoursString} ${minsString}`.trim();
  };

  useEffect(() => {
    setPgmNo(formdata?.NCProgramNo);
  }, [formdata?.NCProgramNo]);

  // console.log("timeDiffInMinutes in Form is ",timeDiffInMinutes);

  const [MachineTime, setMachineTime] = useState("");
  const updateMachineTime1 = () => {
    if (
      formdata?.ActualTime === null ||
      isNaN(formdata?.ActualTime) ||
      isNaN(timeDiffInMinutes)
    ) {
      setMachineTime(null); // Set MachineTime to null if data is unavailable
      return;
    }

    const hoursActualTime = Math.floor(formdata?.ActualTime / 60); // Calculate hours from ActualTime
    const minsActualTime = formdata?.ActualTime % 60; // Calculate remaining minutes from ActualTime
    const hoursTimeDiff = Math.floor(timeDiffInMinutes / 60); // Calculate hours from timeDiffInMinutes
    const minsTimeDiff = timeDiffInMinutes % 60; // Calculate remaining minutes from timeDiffInMinutes

    // Calculate total hours and minutes for MachineTime
    const totalHours = hoursActualTime + hoursTimeDiff;
    const totalMins = minsActualTime + minsTimeDiff;

    // Adjust the total if minutes exceed 60
    const adjustedHours = totalHours + Math.floor(totalMins / 60);
    const adjustedMins = totalMins % 60;

    // Update MachineTime
    const newMachineTime = `${adjustedHours} Hrs ${adjustedMins} Min`;
    setMachineTime(newMachineTime);
  };

  useEffect(() => {
    updateMachineTime1();
  }, [formdata?.ActualTime, timeDiffInMinutes]);

  useEffect(() => {
    getMachineShiftStatusForm();
  }, []);


  return (
    <>
      <div>
        <div className="col-md-12 col-sm-12">
          <div className="form-bg">
            <div className="col-md-8  ms-4" style={{ textAlign: "center", marginTop: "-11px" }}>
              <label className="form-label ms-5">
                NC Program sheet Details
              </label>
            </div>
            
            
            <div className="d-flex">
              <div className="d-flex col-md-6" style={{ gap: "24px", marginTop: "-7px" }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                Program no
                </label>
                <input
                  className="input-field "
                  style={{width:"65px"}}
                  // value={formdata?.Qty || ""}
                  value={
                    formdata?.NCProgramNo !== undefined
                      ? formdata?.NCProgramNo
                      : ""
                  }/>
              </div>
              </div>


            <div className="row">
              <div className="d-flex col-md-6" style={{ gap: "32px", marginTop: "-5px", marginLeft:'-12px' }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  To Process
                </label>
                <input
                  className="input-field "
                  // value={formdata?.Qty || ""}
                  value={formdata?.Qty !== undefined ? formdata?.Qty : ""}
                />
              </div>

              <div className="d-flex col-md-6" style={{ gap: "45px", marginTop: "-5px", marginLeft:'-12px' }}>
                <label className="form-label">Allotted</label>
                <input
                  className="input-field"
                  value={
                    formdata?.QtyAllotted !== undefined
                      ? formdata?.QtyAllotted
                      : ""
                  }
                />
              </div>

              <div className="d-flex col-md-6" style={{ gap: "34px", marginTop: "-5px", marginLeft:'-12px' }}>
                <label className="form-label">Processed</label>
                <input
                  className="input-field"
                  // value={formdata?.QtyCut}
                  value={formdata?.QtyCut !== undefined ? formdata?.QtyCut : ""}
                />
              </div>

              <div className="d-flex col-md-6" style={{ gap: "37px", marginTop: "-5px", marginLeft:'-12px' }}>
                <label className="form-label">Drawings</label>
                <input
                  className="input-field"
                  // value={formdata?.NoOfDwgs || ""}
                  value={
                    formdata?.NoOfDwgs !== undefined ? formdata?.NoOfDwgs : ""
                  }
                />
              </div>

              <div className="d-flex col-md-6" style={{ gap: "30px", marginTop: "-5px", marginLeft:'-12px' }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  Total parts
                </label>
                <input
                  className="input-field"
                  // value={formdata?.TotalParts || ""}
                  value={
                    formdata?.TotalParts !== undefined
                      ? formdata?.TotalParts
                      : ""
                  }
                />
              </div>

              <div className="d-flex col-md-6" style={{ gap: "10px", marginTop: "-5px", marginLeft:'-12px' }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  Program Time
                </label>
                <input
                  className="input-field"
                  value={
                    formdata?.EstimatedTime !== null
                      ? convertMinutesToTime(formdata?.EstimatedTime)
                      : " "
                  }
                />
              </div>

              <div className="d-flex col-md-6" style={{ gap: "10px", marginTop: "-5px", marginLeft:'-12px' }}>
                <label className="form-label" style={{ whiteSpace: "nowrap" }}>
                  Machine Time
                </label>
                <input className="input-field" value={MachineTime ?? ""} />
              </div>

              <div className="d-flex col-md-6" style={{marginTop: "-5px"}}>
                {!hasBOM ? (
                  <button
                    className="button-style group-button"
                    onClick={loadProgramSubmit}
                  >
                    Load Program Material
                  </button>
                ) : null}
              </div>

              <div className="d-flex col-md-12 mb-1" style={{ gap: "40px", marginTop: "-5px", marginLeft:'-12px' }}>
                <label className="form-label">Remarks</label>
                <input
                  className="input-field"
                  value={formdata?.Remarks || ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasBOM === true ? (
        <ProgrmMatrlTableService
          showTable={showTable}
          selectshifttable={selectshifttable}
          setMachinetaskdata={setMachinetaskdata}
        />
      ) : (
        <ProgramMtrlTableProfile
          afterRefreshData={afterRefreshData}
          setAfterRefreshData={setAfterRefreshData}
          showTable={showTable}
          selectedMtrlTable={selectedMtrlTable}
          rowSelectMtrlTable={rowSelectMtrlTable}
          setSelectedMtrlTable={setSelectedMtrlTable}
          selectedMachine={selectedMachine}
          ProgramNo={ProgramNo}
          getmiddleTbaleData={getmiddleTbaleData}
          selectshifttable={selectshifttable}
          setMachinetaskdata={setMachinetaskdata}
        />
      )}

      <GlobalModal
        show={loadProgram}
        title="magod_machine"
        content={
          <div>
            Do You wish to Load Material ID:{" "}
            <strong>{selectedMtrlTable[0]?.ShapeMtrlID}</strong> ?
          </div>
        }
        onYesClick={() => onclickofYes()}
        onNoClick={() => setLoadProgram(false)}
        onClose={handleClose}
      />

      <GlobalModal
        show={mismatchModal}
        title="magod_machine"
        content={<div>Parts Quantity Mismatch</div>}
        onYesClick={() => setmismatchModal(false)}
        onNoClick={() => setmismatchModal(false)}
        onClose={handleClose}
      />
    </>
  );
}
