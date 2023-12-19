import React from "react";
import "./StatBox.css";

export default function StatBox(props) {

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

    return(
        <div className="StatBox">
            <div className="stat-top">
                <b>{provideDefault(props.type, "Type")}</b>
            </div>
            <div className="stat-bottom" onClick={() => {navigator.clipboard.writeText(Math.abs(props.value))}}>
                <div className="stat-value-display" style={{backgroundColor: props.value >= 0? "rgba(56,84,44,1)":"rgba(95,33,33,1)"}}>{processValue(props.value)}</div>
            </div>
        </div>
    )
}