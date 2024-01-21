import React, {useState, useEffect} from "react";
import './LoginPage.css';

export default function Page(props) {

    useEffect(() => {window.scrollTo(0, 0);})

    return(
        <div className="LoginPage">
            <h2 className="message">{props.loginMessage}</h2>
            <input className="sheet-input" placeholder="Google Sheet Name" type="text" name="file-name" onChange={(e) => props.setSheetName(e.target.value)}/>
            <input className="worksheet-input" placeholder="Worksheet Title" type="text" name="worksheet-name" onChange={(e) => props.setWorksheetTitle(e.target.value)}/>
            <button className="login-btn" type="button" onClick={props.login}>Login</button>
        </div>
    )
}