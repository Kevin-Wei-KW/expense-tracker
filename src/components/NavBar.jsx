import React, { useState } from "react";
import "./NavBar.css";

import {AiFillHome} from 'react-icons/ai';
import {BsFillBarChartFill} from 'react-icons/bs';
import {FaMagnifyingGlass} from 'react-icons/fa6';
import { MdOutlineRefresh, MdExitToApp, MdMoreVert, MdOpenInNew } from "react-icons/md";

export default function NavBar(props) {
    const [extraMenu, setExtraMenu] = useState(false)

    async function updateData() {
        props.setPage("Txns");
        await props.getTxns();
        await props.getStats();
    }

    function goToSpreadsheet() {
        window.open("https://docs.google.com/spreadsheets/d/15y7PRSOtRPBKAhv2jUxeXHsRyZRoo77ZqX6BP7cnx58/edit?usp=sharing", "_blank");
    }

    return (
        <div className="NavBar">
            <div className={props.page=="Txns"? "nav-button selected":"nav-button"} onClick={() => props.setPage("Txns")}><AiFillHome size={40}/></div>
            <div className={props.page=="Stats"? "nav-button selected":"nav-button"} onClick={() => props.setPage("Stats")}><BsFillBarChartFill size={40}/></div>
            <div className="nav-button" onClick={() => setExtraMenu(true)}><MdMoreVert size={40}/></div>  

            { extraMenu &&
                <div className="extra-menu" onClick={() => setExtraMenu(false)}>
                    <button className="nav-extra-button" type="button" onClick={updateData}><MdOutlineRefresh size={20}/>Refresh</button>
                    <button className="nav-extra-button" type="button" onClick={goToSpreadsheet}><MdOpenInNew size={20}/>Spreadsheet</button>
{/*                     <button className="nav-extra-button" type="button" onClick={props.logout}><MdExitToApp size={20}/>Log out</button>     */}
                </div>   
            } 
        </div>
    )
}
