import React, {useState, useEffect} from "react";
import './LoginPage.css';

export default function Page(props) {
    const [showTutorial, setShowTutorial] = useState(false)

    useEffect(() => {window.scrollTo(0, 0);})

    return(
        <div className="LoginPage">
            <h2 className="message">{props.loginMessage}</h2>
            <input className="sheet-input" placeholder="Google Sheet Link" type="text" name="file-link" onChange={(e) => props.setSheetLink(e.target.value.trim())}/>
            <input className="worksheet-input" placeholder="Worksheet Title" type="text" name="worksheet-name" onChange={(e) => props.setWorksheetTitle(e.target.value.trim())}/>
            <button className="login-btn" type="button" onClick={props.login}>Google Login</button>
            
            <div className="misc-btns">
                <button className="home-btn" type="button" onClick={()=>props.setHome(true)}>
                    <span style={{fontSize:'30px', fontFamily:'monospace'}}>&#8617;</span>
                </button>
                <button className="tutorial-btn" type="button" onClick={()=>setShowTutorial(true)}>?</button>
            </div>

            {props.overwriteConfirm && 
            <div className="overwrite-menu">
                <div className="overwrite-message">Confirm overwriting your selected worksheet?"</div>
                <button className="overwrite-button" type="button" onClick={()=>props.overwriteSheet(true)}>Confirm</button>    
                <button className="overwrite-button" type="button" onClick={()=>props.overwriteSheet(false)}>Deny</button>    

            </div>
            }

            {showTutorial &&
            <div className="tutorial" onClick={() => setShowTutorial(false)}>
                <h2>First Time Setup</h2>
                <h3><u>Step 1</u>:</h3>
                <span style={{display:"inline-block"}}>
                    Create a new Google Sheet.
                </span>
                <h3><u>Step 2</u>:</h3>
                <span style={{display:"inline-block"}}>
                    Set a <b>Worksheet Title</b> (shown as TABS at bottom of page) NOT the Google Sheet Name. <br/>
                </span>
                <br/>
                <br/>
                <span style={{display:"inline-block"}}>
                    <b>Warning - contents of this worksheet will be overwritten.</b>
                </span>
                <h3><u>Step 3</u>:</h3>
                <span style={{display:"inline-block"}}>
                    Copy the Google Sheet link (If on mobile, link is in the "Share" menu)
                    In the login page, enter Google Sheet Link and Worksheet Title, then login to your account.
                </span>
                <h3><u>Step 4</u>:</h3>
                <span style={{display:"inline-block"}}>
                    Once logged in, your selected Google Sheet is automatically templated.
                </span>
                <br/>
                <br/>
                <span style={{display:"inline-block"}}>
                    <b>Do not edit headers once templated (style changes are okay).</b>
                </span>
                <br/>
                <br/>
                <h2>Using as an App on Mobile Homescreen</h2>
                <h3><u>Step 1</u>:</h3>
                <span style={{display:"inline-block"}}>
                    Click the "Share" button on your phone browser. <img src="public/share-btn.png" alt="drawing" width="16"/>
                </span>
                <br/>
                <h3><u>Step 2</u>:</h3>
                <span style={{display:"inline-block"}}>
                    Click "Add to Home Screen", then "Add".
                </span>
                <br/>
                <h3><u>Step 3</u>:</h3>
                <span style={{display:"inline-block"}}>
                    Done! You should be able to access the app from your homescreen!
                </span>
                <h3 style={{marginTop: "5vh"}}>Disclaimer:</h3>
                <span style={{display:"inline-block"}}>
                    This web application will gain access to read/write on your Google Sheets. However, only your selected spreadsheet will be accessed.
                </span>
                <br/>
                <span style={{display:"inline-block"}}>
                    No information is transfered and stored elsewhere.
                </span>
                
            </div>
            }

        </div>
    )
}