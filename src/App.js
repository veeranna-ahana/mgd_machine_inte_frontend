import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import WithNav from "./Layout/WithNav";
import Parentroute from "./Layout/Parentroute";
import Login from "./pages/Auth/Login";
import Home from "./pages/Home";
import MachineOperator from "./pages/ShiftOperation/MachineOperator/MachineOperator";
// import OpenShiftLogForm from "./pages/ShiftOperation/OpenShiftLog/OpenShiftLogForm";
import CallFile from "./pages/ShiftOperation/MachineOperator/OpenShiftLog/CallFile";
import ServerInfo from "./pages/ServerInfo/ServerInfo";
import PrintLable from "./pages/ShiftOperation/PrintLable/PrintLable";
import { ToastContainer } from "react-toastify";


function App() {
  return (
  <>
     <ToastContainer/>
    <BrowserRouter>
      <Routes>
        <Route element={<Login />} path="/" />
        <Route path="/home" element={<Home/>} />

        <Route element={<WithNav />}>
          <Route path="/Machine" element={<Parentroute />}> 
          <Route path="/Machine/MachineOperator" element={<MachineOperator/>}/>
          <Route path="/Machine/MachineOperator/OpenShiftLog" element={<CallFile/>}/>
          <Route path="/Machine/ServerInfo" element={<ServerInfo/>}/>
          <Route path="/Machine/PrintLabel" element={<PrintLable/>}/>
          {/* <Route path="/Machine/StoppageList" element={<StoppageList/>}/> */}
          </Route>
          {/* <Route path="/form" element={<CallFile/>}/> */}
        </Route>
      </Routes>
    </BrowserRouter>
</>
  );
}

export default App;
