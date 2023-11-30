import React from "react";
import "./TxnList.css";
import "./LoadingSpinner.css"

import TxnBox from "./containers/TxnBox.jsx";

export default function TxnList(props) {

    return(
        <div className="TxnList">

            {!props.loading && props.txns.map((t, i) =>
                <TxnBox key={t.txn+t.date+t.desc+t.cr} type={t.txn} date={t.date} details={t.desc} value={t.cr != 0? -t.cr:t.dr}/>
            )}
            {props.loading &&
                <div className="spinner-container">
                    <div className="loading-spinner"></div>
                </div>
            }

        </div>
    )
}