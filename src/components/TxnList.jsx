import React, { useEffect, useRef, useCallback } from "react";
import "./TxnList.css";
import "./LoadingSpinner.css"

import TxnBox from "./containers/TxnBox.jsx";

export default function TxnList(props) {
    const txnListRef = useRef(null);
    const sentinelRef = useRef(null);
    const observerRef = useRef(null);
    
    // Create and set up the IntersectionObserver
    useEffect(() => {
        // Clean up previous observer if it exists
        if (observerRef.current) {
            observerRef.current.disconnect();
        }
        
        // Create a new observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry && entry.isIntersecting && !props.loading) {
                    console.log("Sentinel element is visible - loading more transactions");
                    props.getTxns();
                }
            },
            {
                root: txnListRef.current,
                threshold: 0.1
            }
        );
        
        // Start observing the sentinel element
        if (sentinelRef.current) {
            observerRef.current.observe(sentinelRef.current);
        }
        
        // Clean up on unmount
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [props.loading, props.getTxns, props.txns]); // Re-create observer when txns change

    return(
        <div className="TxnList" ref={txnListRef} style={{display: props.hide? "none":"flex"}}>
            {!props.loading && props.txns.length === 0 &&
                <div className="empty-txns">
                    No Transactions Yet
                </div>
            }
            {!props.loading && props.txns && props.txns.map((t, i) => (
                <div key={t.txn + t.date + t.desc + t.cr}>
                    <TxnBox
                        type={t.txn}
                        date={t.date}
                        details={t.desc}
                        value={t.cr !== 0 ? -t.cr : t.dr}
                        clickAction={() => props.editTxn(
                            {
                                "date": t.date,
                                "txn": t.txn,
                                "desc": t.desc ? t.desc : "",
                                "dr": t.dr,
                                "cr": t.cr,
                                "row": i,
                            }
                        )}
                    />
                    {i === props.txns.length - 1 && (
                        <div
                            ref={sentinelRef}
                            style={{ minHeight: '1px', width: '100%', opacity: 0 }}
                        />
                    )}
                </div>
            )
            )}
            {props.loading &&
                <div className="spinner-container">
                    <div className="loading-spinner"></div>
                </div>
            }

        </div>
    )
}