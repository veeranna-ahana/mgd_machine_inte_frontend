import React, { useState } from "react";
import { Table } from "react-bootstrap";
import QuantityModal from "../QuantityModal";

export default function MaterialUsageForm() {
  const [quantity, setQuantity] = useState(false);
  const handleSubmit = () => {
    setQuantity(true);
  };
  return (
    <div>
      <div className="">
        <div className="col-md-12 col-sm-12">
          <div className="ip-box form-bg ">
            <div className="row">
              <div className="col-md-6 " style={{ marginTop: "-10px" }}>
                <label className="form-label" style={{ fontSize: "12px" }}>
                  {" "}
                  IV No :
                </label>
              </div>
              <div className="col-md-6  " style={{ marginTop: "-10px" }}>
                <label className="form-label" style={{ fontSize: "12px" }}>
                  {" "}
                  Issue Date :
                </label>
              </div>

              <div className="col-md-6" style={{ marginTop: "-10px" }}>
                <label className="form-label" style={{ fontSize: "12px" }}>
                  {" "}
                  Sets Issued :
                </label>
              </div>

              <div className="col-md-6" style={{ marginTop: "-10px" }}>
                <label className="form-label" style={{ fontSize: "12px" }}>
                  {" "}
                  Used :
                </label>
              </div>

              <div className="col-md-6 " style={{ marginTop: "-10px" }}>
                <label className="form-label" style={{ fontSize: "12px" }}>
                  {" "}
                  Sets Issued :{" "}
                </label>
                <input className="in-field" style={{ marginTop: "-4px" }} />
              </div>

              <div className="row">
                <div
                  style={{ textAlign: "center", marginTop: "-14px" }}
                  className="col-md-6"
                >
                  <div>
                    <button
                      className="button-style mt-2 group-button mt-4 mb-2"
                      style={{ width: "100px", fontSize: "14px" }}
                      onClick={handleSubmit}
                    >
                      Mark as Used
                    </button>
                  </div>
                </div>

                <div
                  style={{ textAlign: "center", marginTop: "-14px" }}
                  className="col-md-6"
                >
                  <div>
                    <button
                      className="button-style mt-2 group-button mt-4 mb-2"
                      style={{ width: "130px", fontSize: "14px" }}
                    >
                      Mark as Returned
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="col-md-12"
        style={{ overflowY: "scroll", overflowX: "scroll", height: "250px" }}
      >
        <Table striped className="table-data border">
          <thead className="tableHeaderBGColor" style={{ fontSize: "13px" }}>
            <tr>
              <th></th>
              <th>Part Id</th>
              <th>RV No</th>
              <th>Issued</th>
              <th>Used</th>
              <th>Returned</th>
            </tr>
          </thead>

          <tbody className="tablebody" style={{ fontSize: "13px" }}>
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </Table>
      </div>
      {quantity && (
        <QuantityModal quantity={quantity} setQuantity={setQuantity} />
      )}
    </div>
  );
}
