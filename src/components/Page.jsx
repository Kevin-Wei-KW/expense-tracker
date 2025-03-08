import React, {useState} from "react";
import './Page.css';
import AddTxnBtn from "./AddTxnBtn.jsx";
import NavBar from "./NavBar.jsx";

import TxnList from "./TxnList.jsx"
import Stats from "./Stats.jsx"
import AddTxn from "./AddTxn.jsx"

export default function Page(props) {
    const [pageSelector, setPageSelector] = useState("Home");
    const [editingTxn, setEditingTxn] = useState();

    function setEditTxnSelector(data) {
        setPageSelector("AddTxn")
        setEditingTxn(data)
    }

    function setAddTxnSelector() {
        setPageSelector("AddTxn")
        setEditingTxn()
    }

    function showPageContent() {
        window.scrollTo(0, 0);
        if (pageSelector === "AddTxn") {
            return <AddTxn
                    returnHome={()=>setPageSelector("Home")}
                    pushTxns={props.pushTxns}
                    editTxns={props.editTxns}
                    deleteTxns={props.deleteTxns}
                    editingTxn={editingTxn}/>;
        } else if(pageSelector === "Stats") {
            return <Stats stats={props.stats} getStats={props.getStats} loading={props.loadingStats}/>;
        }
    }

    function showAddTxnBtn() {
        if (pageSelector != "AddTxn" && pageSelector != "Stats") {
            return <AddTxnBtn setPage={setAddTxnSelector}/>
        }
    }
    function showNavBar() {
        if (pageSelector != "AddTxn") {
            return <NavBar page={pageSelector} setPage={setPageSelector} getTxns={props.getTxns} getStats={props.getStats} logout={props.logout}/>
        }
    }

    return(
        <div className="Page">
            <TxnList
                txns={props.txns}
                loading={props.loadingTxns}
                getTxns={props.getTxns}
                editTxn={setEditTxnSelector}
                hide={pageSelector !== "Home"}
                style={{display: "none"}}/>
            {showPageContent()}
            {showAddTxnBtn()}
            {showNavBar()}
        </div>
    )
}