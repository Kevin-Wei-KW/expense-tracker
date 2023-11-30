import React from "react";
import "./AddTxnBtn.css";

export default function AddTxnBtn(props) {

    return(
        <div className="AddTxnBtn">
            <div className="add-button" onClick={() => props.setPage()}>
                <b>+ New Transaction</b>
            </div>
        </div>
    )
}