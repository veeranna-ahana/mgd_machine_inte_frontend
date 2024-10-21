import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useGlobalContext } from "../../../../../Context/Context";
import { useMemo } from "react";
import axios from "axios";
import { baseURL } from "../../../../../api/baseUrl";
import { toast } from "react-toastify";
import GlobalModal from "../../GlobalModal";

export default function ProgrmMatrlTableService({
  showTable,
  selectshifttable,
  setMachinetaskdata,
}) {
  const {
    afterloadService,
    setAfterloadService,
    NcId,
    servicetopData,
    NcProgramId,
    setServiceTopData,
    formdata,
    setProgramPartsData,
  } = useGlobalContext();

  // console.log("formdata in service table",formdata?.Ncid);

  const [rowSelectService, setRowSelectService] = useState({});
  const rowSelectPMService = (item, index) => {
    let list = { ...item, index: index };
    setRowSelectService(list);
  };

  useMemo(() => {
    setRowSelectService({ ...afterloadService[0], index: 0 });
  }, [afterloadService[0]]);


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

  const [issuesets, setIssueSets] = useState("");
  const [toCompareData, setToCompareData] = useState([]);
  let QtyUsed = "";
  let QtyReturned = "";
  let Qty = "";
  const onChangeIssueSets = (e) => {
    setIssueSets(e.target.value);
    axios
      .post(baseURL + "/ShiftOperator/onChangeInputField", {
        afterloadService,
      })
      .then((response) => {
        // console.log("input change response", response.data);
        setToCompareData(response.data);
      })
      .catch((error) => {
        console.error("Error in axios request", error);
      });
  };

  const [sendobject, setSendObject] = useState([]);
  const [modalopen, setModalOpen] = useState("");
  const [NC_Pgme_Part_ID, setNC_Pgme_Part_ID] = useState("");

 //mark as used button 
 let qtyToDistribute = "";

 const markAsUsed = () => {
  axios
    .post(baseURL + "/ShiftOperator/getNcProgramId", {
      NcId: formdata?.Ncid,
    })
    .then((response) => {
      const ncPgmePartId = response.data[0].NC_Pgme_Part_ID;
      setNC_Pgme_Part_ID(ncPgmePartId);

      if (issuesets < 0) {
        toast.error("Enter a Positive Number", {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }

      if (!toCompareData || toCompareData.length === 0) {
        toast.error("Parts Quantity is null or mismatch", {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }

      const flattenedToCompareData = toCompareData.flat();

      // Group afterloadService by PartId
      const groupedByPartId = afterloadService.reduce((acc, item) => {
        if (!acc[item.PartId]) {
          acc[item.PartId] = [];
        }
        acc[item.PartId].push(item);
        return acc;
      }, {});

      let hasValidationError = false;
      const newSendObject = []; // Collect all updated objects here

      // Process each group
      const updatedAfterloadService = Object.values(groupedByPartId).flatMap(
        (group) => {
          const match = flattenedToCompareData.find(
            (data) => data.Cust_BOM_ListId === group[0].CustBOM_Id
          );
          const totalUseNow = issuesets * match.Quantity;

          let remainingUseNow = totalUseNow;

          // Distribute useNow across the group based on QtyIssued
          const updatedGroup = group.map((item) => {
            if (remainingUseNow <= 0) {
              return item;
            }

            const availableQty = item.QtyIssued - item.QtyUsed;
            const useNowForItem = Math.min(availableQty, remainingUseNow);
            remainingUseNow -= useNowForItem;

            const updatedItem = {
              ...item,
              useNow: useNowForItem,
              QtyReturned1: useNowForItem,
            };

            // Push all updated objects to newSendObject
            newSendObject.push({
              ...updatedItem,
              NC_Pgme_Part_ID: ncPgmePartId,
              issuesets: issuesets,
              NcId: formdata?.Ncid,
            });

            return updatedItem;
          });

          // If totalUseNow exceeds totalQtyIssued, set validation error
          const totalQtyIssued = group.reduce((sum, item) => sum + item.QtyIssued, 0);
          if ((totalUseNow > totalQtyIssued) || (servicetopData[0]?.QtyUsed + totalUseNow)  > totalQtyIssued) {
            hasValidationError = true;
          }

          return updatedGroup;
        }
      );

      if (hasValidationError) {
        toast.error("Cannot Use More Parts than issued Quantity", {
          position: toast.POSITION.TOP_CENTER,
        });
        return;
      }

      // Update the state with the new values
      setAfterloadService(updatedAfterloadService);

      // Update sendobject state with all updated objects
      setSendObject(newSendObject);

      // Open the modal if no errors
      setModalOpen(true);
      getMachineTaskAfterMU();
    })
    .catch((error) => {
      console.error("Error in axios request", error);
    });
};


  //Onclcick of Yes button in mark as used modal
  const onClickofYes = () => {
    axios
      .post(baseURL + "/ShiftOperator/ServicemarkasUsed", {
        sendobject,
      })
      .then((response) => {
        // console.log(response.data);
        axios
          .post(baseURL + "/ShiftOperator/ServiceAfterpageOpen", {
            selectshifttable,
            NcId:formdata?.Ncid,
          })
          .then((response) => {
            // console.log("required result", response.data);
            setAfterloadService(response?.data);
            if (!response.data) {
              setAfterloadService([]);
            }
          });
        axios
          .post(baseURL + "/ShiftOperator/getprogramParts", {
            NcId: formdata?.Ncid,
          })
          .then((response) => {
            // console.log("excuted data")
            setProgramPartsData(response.data);
            toast.success("Success", {
              position: toast.POSITION.TOP_CENTER,
            });
          });
        axios
          .post(
            baseURL + "/ShiftOperator/getTableTopDeatailsAfterPageRefresh",
            {
              selectshifttable,
            }
          )
          .then((response) => {
            // console.log("required result", response.data);
            setServiceTopData(response.data);
          });
      })
      .catch((error) => {
        console.error("Error in axios request", error);
      });
    setModalOpen(false);
  };


//close modal
  const handleClose = () => {
    setModalOpen(false);
  };


//date format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
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
    const dataCopy = [...afterloadService];
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


  //select ALL
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    const allRowsSelected = rowSelectService.length === afterloadService.length;
    setRowSelectService(allRowsSelected ? [] : afterloadService);
  };

  return (
    <div>
      <GlobalModal
        show={modalopen}
        title="magod_machine"
        content={<>Do you wish to Mark {issuesets} as Used?</>}
        onYesClick={onClickofYes}
        onNoClick={handleClose}
        onClose={handleClose}
      />

      {showTable ? (
        <div className="mt-2">
          <div className="col-md-12 col-sm-12">
            <div className="ip-box form-bg ">
              <div className="row col-md-12 mb-2">
                <div
                  className="col-md-3 "
                  style={{ marginTop: "-10px", marginLeft: "-5px" }}
                >
                  <label
                    className="form-label"
                    style={{ fontSize: "10px", marginLeft: "-15px" }}
                  >
                    IV No :{servicetopData[0]?.IV_No}
                  </label>
                </div>
                <div className="col-md-3" style={{ marginTop: "-10px" }}>
                  <label
                    className="form-label"
                    style={{ fontSize: "10px", marginLeft: "-45px" }}
                  >
                   Issue Date: {servicetopData[0]?.Issue_date ? formatDate(servicetopData[0]?.Issue_date) : "null"}
                  </label>
                </div>

                <div
                  className="col-md-3"
                  style={{ marginTop: "-10px", marginLeft: "-10px" }}
                >
                  <label className="form-label" style={{ fontSize: "10px" }}>
                    Used :{servicetopData[0]?.QtyUsed}
                  </label>
                </div>

                <div className="col-md-3" style={{ marginTop: "-10px" }}>
                  <label
                    className="form-label"
                    style={{ fontSize: "10px", marginLeft: "-15px" }}
                  >
                    Sets Issued :{servicetopData[0]?.QtyIssued}
                  </label>
                </div>

                <div
                  className="col-md-6 d-flex  "
                  style={{ marginTop: "-10px", marginLeft: "-20px" }}
                >
                  <div className="col-md-6 mt-3">
                    <label className="form-label" style={{ fontSize: "12px" }}>
                      Sets Issued :
                    </label>
                  </div>
                  <div className="col-md-10  mt-2">
                    <input
                      className="in-field w-75"
                      style={{ marginTop: "10px" }}
                      onChange={onChangeIssueSets}
                      type="number"
                    />
                  </div>

                  <div className="row">
                    <div
                      style={{ textAlign: "center", marginTop: "-14px" }}
                      className="col-md-6"
                    >
                      <div className="mt-2">
                        <button
                          className="button-style mt-2 group-button mt-4 mx-3 "
                          style={{ width: "100px", fontSize: "14px" }}
                          onClick={markAsUsed}
                        >
                          Mark as Used
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {showTable ? (
        <div
          className="mt-2 col-md-12"
          style={{ overflowY: "scroll", overflowX: "scroll", height: "250px" }}
        >
          <Table striped className="table-data border">
            <thead
              className="tableHeaderBGColor table-space"
              style={{ fontSize: "13px" }}
            >
              <tr>
                <th onClick={handleSelectAll}></th>
                <th onClick={() => requestSort("PartId")}>Part Id</th>
                <th onClick={() => requestSort("RV_No")}>RV No</th>
                <th onClick={() => requestSort("QtyIssued")}>Issued</th>
                <th onClick={() => requestSort("QtyUsed")}>Used</th>
                <th onClick={() => requestSort("QtyReturned1")}>UsedNow</th>
              </tr>
            </thead>

            <tbody
              className="tablebody table-space"
              style={{ fontSize: "12px" }}
            >
              {sortedData().map((item, key) => {
                return (
                  <>
                    <tr
                      onClick={() => {
                        rowSelectPMService(item, key);
                      }}
                      className={
                        key === rowSelectService?.index ? "selcted-row-clr" : ""
                      }
                    >
                      <td></td>
                      <td>{item.PartId}</td>
                      <td>{item.RV_No}</td>
                      <td>{item.QtyIssued}</td>
                      <td>{item.QtyUsed}</td>
                      <td>{item.QtyReturned1 || 0}</td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </Table>
        </div>
      ) : null}
    </div>
  );
}
