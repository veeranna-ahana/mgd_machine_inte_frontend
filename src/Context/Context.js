import Axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { baseURL } from "../api/baseUrl";

const AppContext = React.createContext();

const SnackbarContext = React.createContext({
  isDisplayed: false,
  displayMsg: (msg) => {},
  onClose: () => {},
});

const AuthProvider = ({ children }) => {
  // SET NCID TO A STATE
  const [NcId, setNcId] = useState("");
  const [selectedProgram, setSelectedProgram] = useState({});
  const [afterloadData, setAfterloadData] = useState({});
  const [shiftLogDetails, setShiftLogDetails] = useState([]);
  const [afterRefreshData,setAfterRefreshData]=useState([])
  const [formdata,setFormData]=useState([]);
  const [hasBOM,setHasBOM]=useState('');
  const [machineTaskService, setMachineTaskDataService] = useState([]);
  const [afterloadService,setAfterloadService]=useState([])
  const [shiftSelected,setShiftSelected]=useState({});
  const [servicetopData,setServiceTopData]=useState([]);
  const [NcProgramId,setNcProgramId]=useState('');
  const [pgmNo,setPgmNo]=useState('')
  const [showTable, setShowTable] = useState('');
  const [programPartsData, setProgramPartsData] = useState([]);
  const [partDetailsData, setPartDetailsData] = useState([]);
  const [timeDiffInMinutes, setTimeDiffInMinutes] = useState(0);
  const [getMachinetaskdata, setMachinetaskdata] = useState([]);
  const [machineShiftStatus, setMachineShiftStatus] = useState([]);
  const [tubeCuttingModal,setTubeCuttingModal]=useState(false);
  const [servicedata, setService] = useState([]);


  return (
    <AppContext.Provider
      value={{
        NcId,
        setNcId,
        selectedProgram,
        setSelectedProgram,
        afterloadData,
        setAfterloadData,
        shiftLogDetails,
        setShiftLogDetails,
        afterRefreshData,setAfterRefreshData,
        formdata,setFormData,
        hasBOM,setHasBOM,machineTaskService, setMachineTaskDataService,afterloadService,setAfterloadService,shiftSelected,setShiftSelected,servicetopData,setServiceTopData,NcProgramId,setNcProgramId,pgmNo,setPgmNo,showTable, setShowTable,programPartsData, setProgramPartsData,partDetailsData, setPartDetailsData,timeDiffInMinutes, setTimeDiffInMinutes,getMachinetaskdata, setMachinetaskdata,machineShiftStatus, setMachineShiftStatus,tubeCuttingModal,setTubeCuttingModal,servicedata, setService
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
// make sure use
export const useGlobalContext = () => {
  return useContext(AppContext);
};

export { AuthProvider, SnackbarContext };
