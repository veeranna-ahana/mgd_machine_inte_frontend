import React from "react";
import { Table } from "react-bootstrap";

export default function SideTable({ printLabelData, selectRowPrintLabel, selectedRows }) {
  return (
    <div className="row col-md-12">
      <div className="mt-3">
        <div style={{ height: "390px", overflowY: "scroll" }}>
          <Table striped className="table-data border">
            <thead className="tableHeaderBGColor table-space" style={{ fontSize: "12px" }}>
              <tr>
                <th>DwgName</th>
                <th>Qty Nested</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody className="tablebody table-space" style={{ fontSize: "12px" }}>
              {printLabelData.map((item, index) => (
                <tr
                  key={index}
                  onClick={() => selectRowPrintLabel(index)}
                  className={selectedRows.includes(item) ? "selcted-row-clr" : ""}
                >
                  <td>{item.DwgName}</td>
                  <td>{item.QtyNested}</td>
                  <td>{item.Remarks}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
