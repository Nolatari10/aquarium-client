import React from 'react';
import {CSVLink, CSVDownload } from 'react-csv';


const ExportCSV = ({data, fileName, headers}) => {
    //start with the boxt closed (false)
    const [showConfirm, setShowConfirm] = React.useState(false);
    
    const toggleConfirm = () => {
        setShowConfirm(!showConfirm);
    }
    const handleYes = () => {
    // Logic for "Yes" happens here (the CSVLink handles the actual download)
    setShowConfirm(false); 
  };
     return(
        <div className ="export-csv">
            {!showConfirm ? (
                //Initial state: Just the trigger button
                <button onClick={toggleConfirm}>Export CSV</button>
            ) : (
                //Confirmation state: Show the CSVLink and a cancel button
                <div className="confirmation-box" style={{ border: '1px solid black', padding: '10px' }}>
                    <p>Are you sure you want to export this report?</p>
                    <CSVLink data={data} headers={headers} filename={fileName} className="button" target="_blank" onClick={handleYes}>yes </CSVLink>
                    <button onClick={toggleConfirm}>Cancel</button>
                </div>
            )}
   
        </div>
    );
}


export default ExportCSV;