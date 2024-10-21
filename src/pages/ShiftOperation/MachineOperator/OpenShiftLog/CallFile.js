import React from "react";
import OpenShiftLogForm from "./OpenShiftLogForm";
import MachineShiftStatusForm from "./MachineShiftStatusForm";
import Form1 from "./ProgramMaterialTab/Form1";
import TabsTwo from "./TabsTwo";
import TabsFour from "./TabsFour";
import { useLocation } from "react-router-dom";
import { useGlobalContext } from "../../../../Context/Context";
import { baseURL } from "../../../../api/baseUrl";
import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";

export default function CallFile() {
  const location = useLocation();
  const { data } = location?.state || "";

  let selectedMachine = data?.selectedMachine;
  let finalDay1 = data?.finalDay1;
  let selectshifttable = data?.selectshifttable;
  let Shift = data?.Shift;
  let date = data?.date;

  const {
    NcId,
    setAfterRefreshData,
    setFormData,
    setNcProgramId,
    setAfterloadService,
    setServiceTopData,
    showTable,
    setShowTable,getMachinetaskdata, setMachinetaskdata,machineShiftStatus, setMachineShiftStatus
  } = useGlobalContext();

  const [afterloadProgram, setAfterloadProgram] = useState([]);


  const afterLoadProgram = () => {
    axios
      .post(baseURL + "/ShiftOperator/MachineTasksProfile", {
        NCId: NcId,
      })
      .then((response) => {
        // console.log(response.data);
        setAfterloadProgram(response.data);
        setAfterRefreshData(response.data);
        setShowTable(true);
      });
  };

  // useEffect(() => {
  //   afterLoadProgram();
  // }, []);

  const [shiftSummaryData, setShiftSummaryData] = useState([]);
  const getShiftSummaryData = () => {
    axios
      .post(baseURL + "/ShiftOperator/ShiftSummary", { selectshifttable })
      .then((response) => {
        // console.log(response.data);
        setShiftSummaryData(response.data);
      });
  };

  const getMachineShiftStatusForm = () => {
    // console.log(selectshifttable);
    axios
      .post(baseURL + "/ShiftOperator/getmachineShiftStatus", {
        selectshifttable,
      })
      .then((response) => {
        setMachineShiftStatus(response.data);
      });
  };

  useEffect(() => {
    getMachineShiftStatusForm();
  }, []);

  //Machine Task Table
  let Machine = selectshifttable?.Machine;
  const getMachineTaskData = () => {
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

  //get After  Refresh
  const getmiddleTbaleData = () => {
    axios
      .post(baseURL + "/ShiftOperator/ProgramMaterialAfterRefresh", {
        selectshifttable,
        NcId,
      })
      .then((response) => {
        setAfterRefreshData(response?.data?.complexData1);
        setShowTable(true);
        if (!response.data.complexData1) {
          setAfterRefreshData([]);
          setShowTable(false);
        }
        setFormData(response?.data?.complexData2[0]);
        if (!response?.data?.complexData2[0]) {
          setFormData([]);
        }
        setNcProgramId(response?.data.complexData2[0].Ncid);
      });
  };

  //service middletabledata
  const serviceMiddleTableData = () => {
    axios
      .post(baseURL + "/ShiftOperator/ServiceAfterpageOpen", {
        selectshifttable,
        NcId,
      })
      .then((response) => {
        setAfterloadService(response?.data);
        // setShowTable(true)
        if (!response.data) {
          setAfterloadService([]);
          // setShowTable(false)
        }
      });
  };

  const getTableTopFunc = () => {
    axios
      .post(baseURL + "/ShiftOperator/getTableTopDeatailsAfterPageRefresh", {
        selectshifttable,
      })
      .then((response) => {
        // console.log("required result", response.data);
        setServiceTopData(response.data);
      });
  };

  useEffect(() => {
    // console.log("calling function")
    getmiddleTbaleData();
    getTableTopFunc();
    serviceMiddleTableData();
  }, []);

  return (
    <>
      <div>
        <OpenShiftLogForm
          selectedMachine={selectedMachine}
          finalDay1={finalDay1}
          selectshifttable={selectshifttable}
          showTable={showTable}
          setShowTable={setShowTable}
          getShiftSummaryData={getShiftSummaryData}
          getMachinetaskdata={getMachinetaskdata}
          setMachinetaskdata={setMachinetaskdata}
          getMachineShiftStatusForm={getMachineShiftStatusForm}
          getMachineTaskData={getMachineTaskData}
          getmiddleTbaleData={getmiddleTbaleData}
        />
      </div>

      <div className="row">
        <div className="col-md-2">
          <MachineShiftStatusForm
            selectshifttable={selectshifttable}
            Shift={Shift}
            finalDay1={finalDay1}
            date={date}
            showTable={showTable}
            machineShiftStatus={machineShiftStatus}
            getMachineShiftStatusForm={getMachineShiftStatusForm}
          />
        </div>
        <div className="col-md-4">
          <TabsTwo
            setAfterloadProgram={setAfterloadProgram}
            afterloadProgram={afterloadProgram}
            showTable={showTable}
            selectedMachine={selectedMachine}
            getMachineShiftStatusForm={getMachineShiftStatusForm}
            selectshifttable={selectshifttable}
            getmiddleTbaleData={getmiddleTbaleData}
            setMachinetaskdata={setMachinetaskdata}
          />
        </div>

        <div className="col-md-6">
          <TabsFour
            selectshifttable={selectshifttable}
            afterLoadProgram={afterLoadProgram}
            getShiftSummaryData={getShiftSummaryData}
            shiftSummaryData={shiftSummaryData}
            setShiftSummaryData={setShiftSummaryData}
            getMachinetaskdata={getMachinetaskdata}
            setMachinetaskdata={setMachinetaskdata}
            getMachineShiftStatusForm={getMachineShiftStatusForm}
            setShowTable={setShowTable}
            getMachineTaskData={getMachineTaskData}
          />
        </div>
      </div>
    </>
  );
}
