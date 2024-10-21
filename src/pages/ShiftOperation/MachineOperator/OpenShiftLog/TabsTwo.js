import React, { useState } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Form1 from "./ProgramMaterialTab/Form1";
import ProgramPartsForm from "./ProgramPartsTab/ProgramPartsForm";
export default function TabsTwo({
  afterloadProgram,
  showTable,
  setAfterloadProgram,
  selectedMachine,
  getMachineShiftStatusForm,
  selectshifttable,
  getmiddleTbaleData,setMachinetaskdata
}) {
  const [key, setKey] = useState("pm");

  return (
    <div>
      <div className="row">
        <Tabs
          id="controlled-tab-example"
          activeKey={key}
          onSelect={(k) => setKey(k)}
          className="nav-tabs tab_font mb-1"
        >
          <Tab eventKey="pm" title="Program Material">
            <Form1
              afterloadProgram={afterloadProgram}
              setAfterloadProgram={setAfterloadProgram}
              showTable={showTable}
              selectedMachine={selectedMachine}
              getMachineShiftStatusForm={getMachineShiftStatusForm}
              selectshifttable={selectshifttable}
              getmiddleTbaleData={getmiddleTbaleData}
              setMachinetaskdata={setMachinetaskdata}
            />
          </Tab>

          <Tab eventKey="pp" title="Program Parts">
            <ProgramPartsForm />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
