import React, { useState } from "react";
import "./NavBar.css";

import {AiFillHome} from 'react-icons/ai';
import {BsFillBarChartFill} from 'react-icons/bs';
import {FaMagnifyingGlass} from 'react-icons/fa6';
import { MdOutlineRefresh, MdExitToApp, MdMoreVert } from "react-icons/md";

export default function NavBar(props) {
    const [extraMenu, setExtraMenu] = useState(false)

    async function updateData() {
        props.setPage("Home");
        await props.getTxns();
        await props.getStats();
    }

    return (
        <div className="NavBar">
            <div className={props.page=="Home"? "nav-button selected":"nav-button"} onClick={() => props.setPage("Home")}><AiFillHome size={40}/></div>
            <div className={props.page=="Stats"? "nav-button selected":"nav-button"} onClick={() => props.setPage("Stats")}><BsFillBarChartFill size={40}/></div>
            <div className="nav-button" onClick={() => setExtraMenu(true)}><MdMoreVert size={40}/></div>  

            { extraMenu &&
                <div className="extra-menu" onClick={() => setExtraMenu(false)}>
                    <button className="nav-extra-button" type="button" onClick={updateData}><MdOutlineRefresh size={20}/>Refresh</button>    
                    <button className="nav-extra-button" type="button" onClick={props.logout}><MdExitToApp size={20}/>Log out</button>    
                </div>   
            } 
        </div>
    )
}
