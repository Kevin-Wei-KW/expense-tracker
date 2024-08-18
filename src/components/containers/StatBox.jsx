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
            return "$0.00"
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
            if(value === "Rec") {
                return "Recreational"
            } else {
                return value;
            }
        }
    }

    function getValueColor() {
        if(props.value == 0 || props.value === undefined || isNaN(props.value)) {
            return "rgba(255,255,255,0.3)"
        } else if(props.value > 0) {
            return "rgba(56,84,44,1)"
        } else {
            return "rgba(95,33,33,1)"
        }
    }

    return(
        <div className="StatBox">
            <div className="stat-top">
                <b>{provideDefault(props.type, "Type")}</b>
            </div>
            <div className="stat-bottom" onClick={() => {navigator.clipboard.writeText(formatNumber(Math.abs(props.value)))}}>
                <div className="stat-value-display" style={{backgroundColor: getValueColor()}}>{processValue(props.value)}</div>
            </div>
        </div>
    )
}