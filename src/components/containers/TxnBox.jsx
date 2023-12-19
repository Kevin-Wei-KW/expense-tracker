import React from "react";
import "./TxnBox.css";

export default function TxnBox(props) {

    const formatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,      
        maximumFractionDigits: 2,
    });

    function formatNumber(value) {
        return formatter.format(Number.parseFloat(value));
    }

    function processValue(value) {
        if(value === undefined || isNaN(value)) {
            return "$_________"
        }

        if(value < 0) {
            return "$"+ formatNumber(-value);
        } else {
            return "$" + formatNumber(value);
        }
    }

    function provideDefault(value, placeholder) {
        if(value === undefined || value === "") {
            return placeholder;
        } else {
            return value;
        }
    }

    function getValueColor() {
        if(props.value == 0) {
            return "rgba(255,255,255,0.3)"
        } else if(props.value > 0) {
            return "rgba(56,84,44,1)"
        } else {
            return "rgba(95,33,33,1)"
        }
    }

    return(
        <div className="TxnBox">
            <div className="txn-top">
                <div className="type">
                    <b>{provideDefault(props.type, "Type")}</b>
                </div>
                <div className="date">
                    {provideDefault(props.date, "yyyy-mm-dd")}
                </div>
            </div>
            <div className="txn-bottom">
                <div className="details">
                    {provideDefault(props.details, "")}
                </div>
                <div className="value" onClick={() => {navigator.clipboard.writeText(Math.abs(props.value))}}>
                    <div className="value-display" style={{backgroundColor: getValueColor()}}>
                        {processValue(props.value)}
                    </div>
                </div>
            </div>
        </div>
    )
}