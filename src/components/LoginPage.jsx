import React, {useState, useEffect} from "react";
import './LoginPage.css';

export default function Page(props) {
    const [showTutorial, setShowTutorial] = useState(false)

    useEffect(() => {window.scrollTo(0, 0);})

    return(
        <div className="LoginPage">
            <h2 className="message">{props.loginMessage}</h2>
            <input className="sheet-input" placeholder="Google Sheet Link" type="text" name="file-link" onChange={(e) => props.setSheetLink(e.target.value)}/>
            <input className="worksheet-input" placeholder="Worksheet Title" type="text" name="worksheet-name" onChange={(e) => props.setWorksheetTitle(e.target.value)}/>
            <button className="login-btn" type="button" onClick={props.login}>Login</button>

            <button className="tutorial-btn" type="button" onClick={()=>setShowTutorial(true)}>?</button>

            {showTutorial &&
            <div className="tutorial" onClick={() => setShowTutorial(false)}>
                <h2>First Time Setup</h2>
                <h3>Step 1:</h3>
                <span style={{display:"inline-block"}}>
                    Create a new Google Sheet.
                </span>
                <h3>Step 2:</h3>
                <span style={{display:"inline-block"}}>
                    Set a <b>worksheet title</b> (shown as tabs at bottom of page). <br/>
                    In the upper left cell, type: <b><u>replace</u></b>
                </span>
                <br/>
                <br/>
                <span style={{display:"inline-block"}}>
                    <b>Warning - contents of this worksheet will be overwritten.</b>
                </span>
                <h3>Step 3:</h3>
                <span style={{display:"inline-block"}}>
                    Copy the Google Sheet link (If on mobile, link is in the "Share" menu)
                    In the login page, enter Google Sheet link and Worksheet title, then login to your account.
                </span>
                <h3>Step 4:</h3>
                <span style={{display:"inline-block"}}>
                    Once logged in, your selected Google Sheet is automatically templated.
                </span>
                <br/>
                <br/>
                <span style={{display:"inline-block"}}>
                    <b>Do not edit headers once templated (style changes are okay).</b>
                </span>
                
                <h3 style={{marginTop: "5vh"}}>Disclaimer:</h3>
                <span style={{display:"inline-block"}}>
                    This web application will gain access to read/write on your Google Sheets. However, only your selected spreadsheet will be accessed.
                </span>
                <br/>
                <br/>
                <span style={{display:"inline-block"}}>
                    No information is transfered and stored elsewhere.
                </span>

                
            </div>
            }

        </div>
    )
}