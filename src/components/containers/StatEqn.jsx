import React from "react";
import "./StatEqn.css";

export default function StatEqn(props) {

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
            return value;
        }
    }

    function getValueColor(value) {
        if(value == 0 || value === undefined || isNaN(value)) {
            return "rgba(255,255,255,0.3)"
        } else if(value > 0) {
            return "rgba(56,84,44,1)"
        } else {
            return "rgba(95,33,33,1)"
        }
    }

    return(
        <div className="StatEqn">
            <div 
                className="eqn-value-display"
                style={{backgroundColor: getValueColor(props.valueDr)}}
                onClick={() => {navigator.clipboard.writeText(formatNumber(Math.abs(props.value)))}}
            >
                {processValue(props.valueDr)}
            </div>

            <b>{props.valueCr > 0? "+":"-"}</b>

            <div
                className="eqn-value-display"
                style={{backgroundColor: getValueColor(props.valueCr)}}
                onClick={() => {navigator.clipboard.writeText(formatNumber(Math.abs(props.value)))}}
            >
                {processValue(props.valueCr)}
            </div>

            <b>=</b>

            <div
                className="eqn-value-display"
                style={{backgroundColor: getValueColor(props.valueDr+props.valueCr)}}
                onClick={() => {navigator.clipboard.writeText(formatNumber(Math.abs(props.valueDr+props.valueCr)))}}
            >
                {processValue(props.valueDr+props.valueCr)}
            </div>
        </div>
    )
}