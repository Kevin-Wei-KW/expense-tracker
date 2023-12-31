import React, {useState} from "react";
import './Page.css';
import AddTxnBtn from "./AddTxnBtn.jsx";
import NavBar from "./NavBar.jsx";

import TxnList from "./TxnList.jsx"
import Stats from "./Stats.jsx"
import AddTxn from "./AddTxn.jsx"

export default function Page(props) {
    const [pageSelector, setPageSelector] = useState("Home");

    function showPageContent() {
        window.scrollTo(0, 0);
        if (pageSelector === "AddTxn") {
            return <AddTxn setPage={()=>setPageSelector("Home")} pushTxns={props.pushTxns}/>;
        } else if(pageSelector === "Stats") {
            return <Stats stats={props.stats} getStats={props.getStats} loading={props.loadingStats}/>;
        } else {
            return <TxnList txns={props.txns} loading={props.loadingTxns}/>;
        }
    }

    function showAddTxnBtn() {
        if (pageSelector != "AddTxn" && pageSelector != "Stats") {
            return <AddTxnBtn setPage={()=>setPageSelector("AddTxn")}/>
        }
    }
    function showNavBar() {
        if (pageSelector != "AddTxn") {
            return <NavBar page={pageSelector} setPage={setPageSelector} getTxns={props.getTxns} getStats={props.getStats}/>
        }
    }

    return(
        <div className="Page">
            {showPageContent()}
            {showAddTxnBtn()}
            {showNavBar()}
        </div>
    )
}