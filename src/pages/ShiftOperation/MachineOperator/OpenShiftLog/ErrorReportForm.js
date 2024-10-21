import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import { baseURL } from "../../../../api/baseUrl";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import ValidationAlertModal from "./ValidationAlertModal";
import { toast } from "react-toastify";
import { useGlobalContext } from "../../../../Context/Context";

export default function ErrorReportForm({
  setErrorForm,
  errorForm,
  selectedMachine,
  selectshifttable,
  setShowTable,
}) {
  const { setShiftLogDetails, setFormData } = useGlobalContext();

  const getShiftLog = () => {
    axios
      .post(baseURL + "/ShiftOperator/getShiftLog", {
        selectshifttable: selectshifttable,
      })
      .then((response) => {
        for (let i = 0; i < response.data.length; i++) {
          // FOR TgtDelDate
          let dateSplit = response.data[i].FromTime.split(" ");
          let date = dateSplit[0].split("-");
          let year = date[0];
          let month = date[1];
          let day = date[2];
          let finalDay = day + "/" + month + "/" + year + " " + dateSplit[1];
          response.data[i].FromTime = finalDay;
        }
        for (let i = 0; i < response.data.length; i++) {
          // Delivery_date
          let dateSplit1 = response.data[i].ToTime.split(" ");
          let date1 = dateSplit1[0].split("-");
          let year1 = date1[0];
          let month1 = date1[1];
          let day1 = date1[2];
          let finalDay1 =
            day1 + "/" + month1 + "/" + year1 + " " + dateSplit1[1];
          response.data[i].ToTime = finalDay1;
        }
        setShiftLogDetails(response.data);
      });
  };

  const handleClose = () => {
    setErrorForm(false);
  };

  const [formValues, setFormValues] = useState({
    machine: selectedMachine,
    operator: selectshifttable.Operator,
    errorNo: "",
    errorDescription: "",
    actionTaken: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const onClickReset = () => {
    setFormValues({
      ...formValues,
      errorNo: "",
      errorDescription: "",
      actionTaken: "",
    });
  };

  const [openalert, setOpenAlert] = useState("");
  const handleSubmit = () => {
    const { errorNo, errorDescription, actionTaken } = formValues;
    // Validate required fields
    if (!errorNo || !errorDescription || !actionTaken) {
      toast.error("ErrorNo,Error Description are mandatory", {
        position: toast.POSITION.TOP_CENTER,
      });
      // setOpenAlert(true);
      return;
    }
    axios
      .post(baseURL + "/ShiftOperator/errorForm", {
        formValues,
        selectshifttable,
      })
      .then((response) => {
        getShiftLog();
      });
    handleClose();
    toast.success("Error Report Added Successfully", {
      position: toast.POSITION.TOP_CENTER,
    });
    setFormData([]);
    setShowTable(false);
    onClickReset();
  };

  useEffect(() => {
    getShiftLog();
  }, []);

  // console.log(formValues);

  return (
    <div>
      <ValidationAlertModal openalert={openalert} setOpenAlert={setOpenAlert} />

      <Modal show={errorForm} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontSize: "14px" }}>magod_machine</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div>
            <div className="col-md-12">
              <div className="row">
                <h6>Operator Error Report Form</h6>
              </div>
            </div>
            <div className="ip-box form-bg">
              <div className="row"></div>

              <div className="d-flex ms-3 col-md-12 mt-2">
                <label className="form-label col-md-4">Machine</label>
                <input
                  className="in-field col-md-6"
                  value={formValues.machine}
                  disabled
                />
              </div>

              <div className="col-md-12 mt-2 d-flex ms-3">
                <label className="form-label col-md-4">Operator</label>
                <input
                  className="in-field col-md-6"
                  value={formValues.operator}
                  disabled
                />
              </div>

              <div className="col-md-12 mt-2 d-flex ms-3">
                <label className="form-label col-md-4">Error No</label>
                <input
                  className="in-field col-md-6"
                  name="errorNo"
                  value={formValues.errorNo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 mt-3 d-flex ms-3 ">
                <label className="form-label col-md-8">Error Description</label>
                <textarea
                  className="in-field col-md-4"
                  maxLength={100}
                  style={{
                    height: "80px",
                    width: "223px",
                    resize: "none",
                  }}
                  name="errorDescription"
                  value={formValues.errorDescription}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-md-6 mt-3 d-flex ms-3">
                <label className="form-label col-md-8">Action Taken</label>
                <textarea
                  className="in-field col-md-4"
                  maxLength={100}
                  style={{
                    height: "80px",
                    width: "223px",
                    resize: "none",
                  }}
                  name="actionTaken"
                  value={formValues.actionTaken}
                  onChange={handleInputChange}
                />
              </div>

              <div className="row mt-3 mb-2">
                <div className="col-md-5"></div>

                <div className="col-md-2 col-sm-12">
                  <button
                    className="button-style  group-button"
                    onClick={onClickReset}
                  >
                    Reset
                  </button>
                </div>

                <div className="col-md-1 col-sm-12">
                  <button
                    className="button-style  group-button"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
