import React, { useState } from "react";
import HeadForm from "./components/HeadForm";
import SideTable from "./components/SideTable";
import axios from "axios";
import { baseURL } from "../../../api/baseUrl";
import ShowLabel from "./ShowLabel";

export default function PrintLabel() {
  const [ncprogramNo, setNcprogramNo] = useState("");
  const [printLabelData, setPrintLabelData] = useState([]);

  const LoadProgram = () => {
    axios
      .post(baseURL + "/printLabel/getTabledata", { NcProgramNo: ncprogramNo })
      .then((response) => {
        setPrintLabelData(response.data);
        setSelectedRows([]);
      })
      .catch((error) => {
        console.error("Error occurred:", error);
      });
  };

  // row select
  const [selectedRows, setSelectedRows] = useState([]);
  const selectRowPrintLabel = (index) => {
    const selectedRowData = printLabelData[index];
    const isSelected = selectedRows.some((row) => row === selectedRowData);
    if (isSelected) {
      setSelectedRows(selectedRows.filter((row) => row !== selectedRowData));
    } else {
      setSelectedRows([...selectedRows, selectedRowData]);
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <HeadForm
            setNcprogramNo={setNcprogramNo}
            LoadProgram={LoadProgram}
            selectedRows={selectedRows}
            printLabelData={printLabelData}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-md-5">
          <SideTable
            printLabelData={printLabelData}
            selectedRows={selectedRows}
            selectRowPrintLabel={selectRowPrintLabel}
          />
        </div>
        <div className="col-md-7 mt-3">
          <ShowLabel
            selectedRows={
              selectedRows.length > 0
                ? selectedRows[selectedRows.length - 1]?.DwgName
                : selectedRows.length === 1
                ? selectedRows[0]?.DwgName
                : null
            }
          />
        </div>
      </div>
    </>
  );
}
