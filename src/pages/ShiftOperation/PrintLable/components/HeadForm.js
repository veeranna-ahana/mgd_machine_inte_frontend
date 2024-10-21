import axios from "axios";
import React, { useState } from "react";
import { baseURL } from "../../../../api/baseUrl";
import PrintSelectedModal from "../PrintPDF/PrintSelected/PrintSelectedModal";
import GlobalModal from "../../MachineOperator/GlobalModal";
import PrintAllModal from "../PrintPDF/PrintAll/PrintAllModal";
import { useNavigate } from "react-router-dom";
import PrintAllPdf from "../PrintPDF/PrintAll/PrintAllPdf";
import { PDFDownloadLink, Document, Page, Text } from "@react-pdf/renderer";
import html2pdf from "html2pdf.js";

export default function HeadForm({
  setNcprogramNo,
  LoadProgram,
  selectedRows,
  printLabelData,
}) {
  const handleChangeNcProgram = (e) => {
    setNcprogramNo(e.target.value);
  };

  //Print Selected
  const [currentIndex1, setCurrentIndex1] = useState(0);
  const [askPrintSelected, setAskPrintSelected] = useState("");
  const [onClickyesPS, setOnclickofYesPS] = useState(false);
  const [loopedBack1, setLoopedBack1] = useState(false);

  const askPrintSelectedModal = () => {
    setAskPrintSelected(true);
  };

  const hadleclose1 = () => {
    setAskPrintSelected(false);
  };

  const onClickofyesPS = () => {
    setAskPrintSelected(false);
    const currentObject1 = selectedRows[currentIndex1];
    setOnclickofYesPS(currentObject1);
    askPrintSelectedModal();
  };
  const currentObject1 = selectedRows[currentIndex1];

  const handleClosepdf1 = () => {
    setOnclickofYesPS(false);
    if (currentIndex1 + 1 < selectedRows.length) {
      setCurrentIndex1(currentIndex1 + 1);
      askPrintSelectedModal();
    } else {
      if (!loopedBack1) {
        setLoopedBack1(true);
        setAskPrintSelected(false);
      }
    }
  };

  //Print All Modal
  const [currentIndex, setCurrentIndex] = useState(0);
  const [askPrintAll, setAskPrintAll] = useState("");
  const [onClickyes, setOnclickofYes] = useState(false);
  const [loopedBack, setLoopedBack] = useState(false);

  const askPrintAllModal = () => {
    setAskPrintAll(true);
  };

  const hadleclose = () => {
    setAskPrintAll(false);
  };

  const onClickofyes = () => {
    setAskPrintAll(false);
    const currentObject = printLabelData[currentIndex];
    setOnclickofYes(currentObject);
    askPrintAllModal();
  };

  const currentObject = printLabelData[currentIndex];

  const handleClosepdf = () => {
    setOnclickofYes(false);
    if (currentIndex + 1 < printLabelData.length) {
      setCurrentIndex(currentIndex + 1);
      askPrintAllModal();
    } else {
      if (!loopedBack) {
        setLoopedBack(true);
        setAskPrintAll(false);
      }
    }
  };

  //onclick of close
  const navigate = useNavigate();
  const onClickofClose = () => {
    navigate("/Machine");
  };

  // console.log("selectedRows",selectedRows);
  // console.log("printLabelData",printLabelData);

  // ///Print ALL
  const generateAndDownloadPDF = () => {
    const currentObject = printLabelData[currentIndex]; // Retrieve the current object
    const textContent = `
      <p 
        style="
           font-weight: bold; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        font-size: 12px; /* Adjust this to the desired font size */
        "
      >
        ${currentObject.DwgName}
      </p>`; // Apply CSS properties using inline CSS
    const element = document.createElement("div"); // Create a new <div> element
    element.innerHTML = textContent; // Set the inner HTML of the element
    const opt = {
      margin: 1,
      filename: "document.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: [50, 25], orientation: "landscape" }, // Set unit to 'mm' and adjust format and orientation as needed
    };
  
    // Generate and download the PDF, then execute the additional logic
    html2pdf().from(element).set(opt).save().then(() => {
      setOnclickofYes(false);
      if (currentIndex + 1 < printLabelData.length) {
        setCurrentIndex(currentIndex + 1);
        askPrintAllModal();
      } else {
        if (!loopedBack) {
          setLoopedBack(true);
          setAskPrintAll(false);
        }
      }
    });
  };
  

//Print Selected
const PrintSelectedPDF = () => {
  const currentObject1 = selectedRows[currentIndex1]; // Retrieve the current object based on currentIndex1
  const textContent = `
    <p 
      style="
        font-weight: bold; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        font-size: 12px; /* Adjust this to the desired font size */
      "
    >
      ${currentObject1.DwgName}
    </p>`; // Apply CSS properties using inline CSS

  const element = document.createElement("div"); // Create a new <div> element
  element.innerHTML = textContent; // Set the inner HTML of the element

  const opt = {
    margin: 1,
    filename: "document.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: [50, 25], orientation: "landscape" }, // Set unit to 'mm' and adjust format and orientation as needed
  };

  // Generate and download the PDF
  html2pdf().from(element).set(opt).save().then(() => {
    // Code to execute after PDF generation and download
    // setOnclickofYesPS(false); // Reset the click state for yes button
    if (currentIndex1 + 1 < selectedRows.length) {
      setCurrentIndex1(currentIndex1 + 1); // Move to the next selected row
      askPrintSelectedModal(); // Ask to print the next selected item
    } else {
      if (!loopedBack1) {
        setLoopedBack1(true); // Mark as looped back
        setAskPrintSelected(false); // Close the modal
      }
    }
  });
};







  return (
    <>
      <div className="row">
        <h4 className="title">Program Parts List</h4>
      </div>

      <div className="row">
        <div className="d-flex col-md-4 mt-1" style={{ gap: "10px" }}>
          <label className="form-label" style={{ whiteSpace: "nowrap" }}>
            Enter NC Program No
          </label>
          <input
            className="in-field mt-1"
            type="text"
            onChange={handleChangeNcProgram}
          />
        </div>

        <div className="col-md-6">
          <button className="button-style group-button" onClick={LoadProgram}>
            Load Program
          </button>

          <button
            className="button-style group-button"
            onClick={askPrintAllModal}
          >
            Print All
          </button>

          <button
            className="button-style  group-button"
            onClick={askPrintSelectedModal}
          >
            Print Selected
          </button>
        </div>

        <div className="col-md-2">
          <button
            className="button-style  group-button"
            onClick={onClickofClose}
            style={{ float: "right" }}
          >
            Close
          </button>
        </div>
      </div>

      <PrintAllModal
        onClickyes={onClickyes}
        setOnclickofYes={setOnclickofYes}
        currentObject={currentObject?.DwgName}
        onClose={() => handleClosepdf()}
      />

      <PrintSelectedModal
        openPrintSelect={onClickyesPS}
        setOpenPrintSelected={setOnclickofYesPS}
        currentObjectNew={currentObject1?.DwgName}
        onClose={() => handleClosepdf1()}
      />

      <GlobalModal
        show={askPrintSelected}
        title="magod_machine"
        content={<div>Print Selected Labels  '{currentObject1?.DwgName}' ?</div>}
        onYesClick={() => PrintSelectedPDF()}
        onNoClick={() => hadleclose1()}
        onClose={() => hadleclose1()}
      />

      <GlobalModal
        show={askPrintAll}
        title="magod_machine"
        content={<div>Print '{currentObject?.DwgName}' Labels?</div>}
        onYesClick={() => generateAndDownloadPDF()}
        onNoClick={() => hadleclose()}
        onClose={() => hadleclose()}
      />
    </>
  );
}
