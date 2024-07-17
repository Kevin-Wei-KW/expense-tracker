import React from "react";
import "./TxnList.css";
import "./LoadingSpinner.css"

import TxnBox from "./containers/TxnBox.jsx";

export default function TxnList(props) {
    return(
        <div className="TxnList">
            {!props.loading && props.txns.length === 0 &&
                <div className="empty-txns">
                    No Transactions Yet
                </div>
            }
            {!props.loading && props.txns && props.txns.map((t, i) =>
                <TxnBox
                    key={t.txn+t.date+t.desc+t.cr}
                    type={t.txn} date={t.date}
                    details={t.desc}
                    value={t.cr != 0? -t.cr:t.dr}
                    clickAction={() => props.editTxn(
                        {
                            "date": t.date,
                            "txn": t.txn,
                            "desc": t.desc? t.desc: "",
                            "dr": t.dr,
                            "cr": t.cr,
                            "row": i,
                        }
                    )}/>
            )}
            {props.loading &&
                <div className="spinner-container">
                    <div className="loading-spinner"></div>
                </div>
            }

        </div>
    )
}