import React, { useState } from 'react';
import ErrorReportForm from './ErrorReportForm';
import AlreadyLoadModal from './AlreadyLoadModal';

export default function OpenShiftLogForm({ selectedMachine, finalDay1, selectshifttable }) {
  const [errorForm, setErrorForm] = useState(false);
  const [isInputVisible, setInputVisible] = useState(false);
  var count = 0;

  const toggleInput = () => {
    setInputVisible(!isInputVisible)


  };

  const handleOpen = () => {
    setErrorForm(true)
  }

  const refreshSubmit = () => {
    setInputVisible(false);
  }
  let array = finalDay1.split('/');
  let finalDay = array[0] + '/' + array[1];

  const [alreadyLoad, setAlreadyLoad] = useState(false);
 

  
  const selectBothOption = (e) => {
  
    console.log("select option", e.target.value);
    if (e.target.value !== '' ) {
      console.log("guu");
      setAlreadyLoad(true);
    }
    else {
      console.log("rtyuiop");
    }
  }
  return (

    <>
     
      <div>
        <div className="col-md-12">
          <div className="row">
          </div>
        </div>
        <div className="row">
          <div style={{ marginTop: "10px" }} className="col-md-6 col-sm-12">
          </div>


          <div className="col-md-1 col-sm-12">
            
          </div>
        </div>

        <div className="row">
          
        </div>



        


      </div>
      

    </>
  );
}
