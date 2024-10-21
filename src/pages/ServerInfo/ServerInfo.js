import React from 'react'
import Form from './Form'

export default function ServerInfo() {
  return (
    <div>
     <div className="col-md-12">
        <div className="">
          <h4 className="title">Server Set Up</h4>
        </div>
      </div>

      <div className="col-md-3">
          <h5 className="mt-2" style={{marginLeft:'10px'}}>Magod MIS Server</h5>
      </div>
      <div className="row col-md-12 bg-light">

        <div className="col-md-6 mb-3">

            <div className="">
                <h6 className="mt-2">Data Server</h6>
            </div>

           <div className="">
                <label className="form-label">Server Name</label>
                <input className="in-field" style={{marginTop:'-7px'}}/>
            </div>

            <div className="">
                <label className="form-label">Driver</label>
                <input className="in-field" style={{marginTop:'-7px'}}/>
            </div>

            <div className="">
                <label className="form-label">Option</label>
                <input className="in-field" style={{marginTop:'-7px'}}/>
            </div>

            <div className="mt-1">
                <button className="button-style mt-2 group-button">
                    Reset
                </button>
            </div>
        </div>

        <div className="col-md-6">

            <div className="">
                <h6 className="mt-2">Mail Server</h6>
            </div>

            <div className="" style={{marginBottom:'120px'}}>
                <label className="form-label">Server Name</label>
                <input className="in-field" style={{marginTop:'-7px'}}/>
            </div>

            <div className="">
                <button className="button-style mt-2 group-button"
                    style={{ width: "150px"}}>
                        Save
                </button>
            </div>
        </div>
      </div>
     
    </div>
  )
}
