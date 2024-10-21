import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { Table } from "react-bootstrap";
import { toast } from "react-toastify";
import { baseURL } from "../../../../../api/baseUrl";
import { useState } from "react";

export default function MachineTaskProfile({
  selectedProgram,
  machineTaskData,
  machinetask,
  setIsDataDisplayed,
}) {
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
    const dataCopy = [...machineTaskData];
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
    <div
      className="col-md-12 mt-1"
      style={{ overflowY: "scroll", overflowX: "scroll", height: "200px" }}
    >
      <Table striped className="table-data border">
        <thead className="tableHeaderBGColor" style={{ fontSize: "12px" }}>
          <tr>
            <th onClick={() => requestSort("ShapeMtrlID")}>Shape Id</th>
            <th onClick={() => requestSort("Para1")}>Width</th>
            <th onClick={() => requestSort("Para2")}>Length</th>
            <th onClick={() => requestSort("Used")}>Used</th>
            <th onClick={() => requestSort("Rejected")}>Reject</th>
          </tr>
        </thead>

        <tbody className="tablebody table-space" style={{ fontSize: "12px" }}>
          {sortedData().map((data, key) => (
            <tr
              className={
                key === selectedProgram?.index ? "selcted-row-clr" : ""
              }
            >
              <td>{data.ShapeMtrlID}</td>
              <td>{data.Para1}</td>
              <td>{data.Para2}</td>
              <td>
                <input type="checkbox" checked={data.Used === 1} />
              </td>
              <td>
                <input type="checkbox" checked={data.Rejected === 1} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
