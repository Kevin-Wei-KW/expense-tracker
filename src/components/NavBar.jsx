import React from "react";
import "./NavBar.css";

import {AiFillHome} from 'react-icons/ai';
import {BsFillBarChartFill} from 'react-icons/bs';
import {FaMagnifyingGlass} from 'react-icons/fa6';
import { MdOutlineRefresh } from "react-icons/md";

export default function NavBar(props) {

    async function updateData() {
        props.setPage("Home");
        await props.getTxns();
        await props.getStats();
    }

    return (
        <div className="NavBar">
            <div className={props.page=="Home"? "nav-button selected":"nav-button"} onClick={() => props.setPage("Home")}><AiFillHome size={40}/></div>
            <div className={props.page=="Stats"? "nav-button selected":"nav-button"} onClick={() => props.setPage("Stats")}><BsFillBarChartFill size={40}/></div>
            <div className="nav-button" onClick={updateData}><MdOutlineRefresh size={40}/></div>      
        </div>
    )
}
