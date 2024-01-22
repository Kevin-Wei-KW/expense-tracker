import React, {useState, useEffect} from "react";
import './LoginPage.css';

export default function Page(props) {
    const [showTutorial, setShowTutorial] = useState(false)

    useEffect(() => {window.scrollTo(0, 0);})

    return(
        <div className="LoginPage">
            <h2 className="message">{props.loginMessage}</h2>
            <input className="sheet-input" placeholder="Google Sheet Name" type="text" name="file-name" onChange={(e) => props.setSheetName(e.target.value)}/>
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
                    Take note of <b>Google Sheet name</b> and a <b><u>blank</u> worksheet title</b> (shown as tabs at bottom of page).
                </span>
                <br/>
                <br/>
                <span style={{display:"inline-block"}}>
                    <b>Warning - contents of worksheet will be overwritten.</b>
                </span>
                <h3>Step 3:</h3>
                <span style={{display:"inline-block"}}>
                    Enter Google Sheet name and title, then login to your account.
                </span>
                <h3>Step 4:</h3>
                <span style={{display:"inline-block"}}>
                    Once logged in, your selected Google Sheet is automatically templated.
                </span>
                
                <h3 style={{marginTop: "10vh"}}>Disclaimer:</h3>
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