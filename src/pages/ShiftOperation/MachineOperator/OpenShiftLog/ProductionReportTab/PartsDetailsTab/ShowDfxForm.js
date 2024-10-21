import axios from "axios";
import React, { useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import { baseURL } from "../../../../../../api/baseUrl";
import { useGlobalContext } from "../../../../../../Context/Context";
import { useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

export default function ShowDfxForm({ openTable, selectProductionReport }) {
  const { NcId, partDetailsData, setPartDetailsData } = useGlobalContext();

  const getPartDetails = () => {
    axios
      .post(baseURL + "/ShiftOperator/getpartDetails", {
        selectProductionReport,
      })
      .then((response) => {
        // Ensure that Remarks is set to an empty string if it is 'null'
        const dataWithValidRemarks = response.data.map((item) => ({
          ...item,
          Remarks: item.Remarks === "null" ? "" : item.Remarks,
        }));
        setPartDetailsData(dataWithValidRemarks);
      });
  };

  useEffect(() => {
    getPartDetails();
  }, [selectProductionReport]);

  const [partDetailsRowSelect, setPartDetailsRowSelect] = useState({});
  const selectRowPartsDetails = (item, index) => {
    let list = { ...item, index: index };
    setPartDetailsRowSelect(list);
  };

  useMemo(() => {
    if (partDetailsData.length > 0) {
      setPartDetailsRowSelect({ ...partDetailsData[0], index: 0 });
    }
  }, [partDetailsData]);

  const remarksChange = (e, key, valueRemarks) => {
    const updatedRow = { ...partDetailsRowSelect };
    updatedRow.Remarks = e.target.value;
    setPartDetailsRowSelect(updatedRow);
  };

  const onChnageReject = (index, field, value) => {
    const updatedpartDetailsData = [...partDetailsData]; // Create a copy of the array
    updatedpartDetailsData[index] = {
      ...updatedpartDetailsData[index],
      [field]: value,
    };
    setPartDetailsData(updatedpartDetailsData);
  };

  const savePartDetails = () => {
    // Check for any errors in partDetailsData
    const updatedPartDetailsData = [...partDetailsData];
    
    const hasErrors = updatedPartDetailsData.some((item, index) => {
      const isInvalidRemark =
        !item.Remarks || item.Remarks.trim() === "" || item.Remarks === "null";
  
      // Check if QtyRejected is greater than the product of Sheets and QtyNested minus QtyCut
      const totalQty = item.Sheets * item.QtyNested;
      const isQtyRejectedExceeded = item.QtyRejected > (totalQty - item.QtyCut);
  
      if (item.QtyRejected > 0 && isInvalidRemark) {
        toast.error("Please provide remarks for rejection", {
          position: toast.POSITION.TOP_CENTER,
        });
        return true; // Stop if remarks are missing for rejected quantity
      }
  
      if (isQtyRejectedExceeded) {
        toast.error("Rejected quantity should not be greater than nested quantity", {
          position: toast.POSITION.TOP_CENTER,
        });
        // Reset QtyRejected to 0 if it exceeds the allowed limit
        updatedPartDetailsData[index].QtyRejected = 0;
        setPartDetailsData(updatedPartDetailsData);
        return true; // Stop if rejected quantity exceeds the limit
      }
  
      return false; // No errors for this item
    });
  
    if (hasErrors) {
      // Stop the function if there are errors
      return;
    }
  
    // Proceed with the API call if no errors
    axios
      .post(baseURL + "/ShiftOperator/SaveprogramDetails", {
        partDetailsData: updatedPartDetailsData,
      })
      .then((response) => {
        toast.success("Data Saved Successfully", {
          position: toast.POSITION.TOP_CENTER,
        });
      })
      .catch((error) => {
        console.log("Error saving data", error);
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
    const dataCopy = [...partDetailsData];
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

  return (
    <div>
      <div className="form-bg">
        <div className="row mb-3" style={{ marginLeft: "-5px", marginTop: "-15px" }}>
          <div className="col-md-6" style={{ textAlign: "center", marginLeft: "-12px" }}>
            <button className="button-style group-button" onClick={savePartDetails}>
              Save
            </button>
          </div>

          <div style={{ textAlign: "center" }} className="col-md-6">
            <button className="button-style group-button">Show Dfx</button>
          </div>
        </div>
      </div>

      {openTable ? (
        <div className="col-md-12" style={{ overflowY: "scroll", overflowX: "scroll", height: "250px" }}>
          <Table striped className="table-data border table-space">
            <thead className="tableHeaderBGColor" style={{ fontSize: "13px" }}>
              <tr>
                <th></th>
                <th onClick={() => requestSort("DwgName")}>Dwg Name</th>
                <th onClick={() => requestSort("TotQtyNested")}>Total Nested</th>
                <th onClick={() => requestSort("QtyCut")}>Produced</th>
                <th onClick={() => requestSort("QtyRejected")}>Rejected</th>
                <th onClick={() => requestSort("Remarks")}>Remarks</th>
              </tr>
            </thead>

            <tbody className="tablebody table-space" style={{ fontSize: "13px" }}>
              {partDetailsData.length === 0 ? (
                <tr>
                  <td colSpan="6">No data to show</td>
                </tr>
              ) : (
                sortedData().map((value, key) => (
                  <tr
                    key={key}
                    onClick={() => {
                      selectRowPartsDetails(value, key);
                    }}
                    className={key === partDetailsRowSelect?.index ? "selcted-row-clr" : ""}
                  >
                    <td></td>
                    <td>{value?.DwgName}</td>
                    <td>{value.QtyNested * value.Sheets}</td>
                    <td>{value?.QtyCut}</td>
                    <td>
                      <input
                        className="table-cell-editor"
                        value={value?.QtyRejected}
                        onChange={(e) => onChnageReject(key, "QtyRejected", e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="table-cell-editor"
                        value={value?.Remarks === "null" ? "" : value?.Remarks}
                        onChange={(e) => onChnageReject(key, "Remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
