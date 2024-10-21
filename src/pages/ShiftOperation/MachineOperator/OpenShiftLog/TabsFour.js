import React, { useEffect, useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import MachineTaskTable from "./MachineTasksTab/MachineTaskTable";
import FormAndTable from "./ShiftLogTab/FormAndTable";
import ShiftSummryTable from "./ShiftSummaryTab/ShiftSummryTable";
import ProgramInfoForms from "./ProductionReportTab/ProgramInfoForms";
import axios from "axios";
import { baseURL } from "../../../../api/baseUrl";
import { useGlobalContext } from "../../../../Context/Context";

export default function TabsFour({
  selectshifttable,
  afterLoadProgram,
  setShowTable,
  shiftSummaryData,
  setShiftSummaryData,
  getMachinetaskdata,
  setMachinetaskdata,
  getMachineShiftStatusForm,
  getMachineTaskData,
  getShiftSummaryData,
}) {
  const [key, setKey] = useState("mt");
  const [showtab, setShowtab] = useState(false);

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
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // console.log('Effect is running...');
    const intervalId = setInterval(() => {
      // console.log('Updating time and date...');
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDate());
    }, 1000);

    // Clean up the interval when the component is unmounted
    return () => {
      clearInterval(intervalId);
      // console.log('Interval cleared.');
    };
  }, []);

  let Machine = selectshifttable?.Machine;

  const { setShiftLogDetails, shiftLogDetails } = useGlobalContext();
  //ShiftLog Table
  const getShiftLogDetails = () => {
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
  };
  

  useEffect(() => {
    getShiftLogDetails();
  }, []);


  useEffect(() => {
    getMachineTaskData();
  }, [Machine]);

  return (
    <div>
      <div className="row">
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="mb-1 nav-tabs tab_font"
        >
          <Tab eventKey="mt" title="Machine Tasks">
            <MachineTaskTable
              //  shiftLogDetails={shiftLogDetails}
              selectshifttable={selectshifttable}
              getMachinetaskdata={getMachinetaskdata}
              afterLoadProgram={afterLoadProgram}
              setShowTable={setShowTable}
              getMachineShiftStatusForm={getMachineShiftStatusForm}
            />
          </Tab>

          <Tab eventKey="sl" title="Shift Log">
            <FormAndTable
              getShiftLogDetails={getShiftLogDetails}
              selectshifttable={selectshifttable}
              setShowTable={setShowTable}
            />
          </Tab>

          <Tab eventKey="pr" title="Production Report">
            <ProgramInfoForms
              getMachinetaskdata={getMachinetaskdata}
              selectshifttable={selectshifttable}
              getMachineTaskData={getMachineTaskData}
              setMachinetaskdata={setMachinetaskdata}
            />
          </Tab>

          <Tab eventKey="ss" title="Shift Summary">
            <ShiftSummryTable
              selectshifttable={selectshifttable}
              shiftSummaryData={shiftSummaryData}
              setShiftSummaryData={setShiftSummaryData}
              getShiftSummaryData={getShiftSummaryData}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
