import React, {useState, useEffect} from "react";
import "./Stats.css";

import StatBox from "./containers/StatBox.jsx"
import StatEqn from "./containers/StatEqn.jsx"

import "./LoadingSpinner.css"

export default function Stats(props) {
    let yearNow = new Date().getFullYear();

    const [year, setYear] = useState(yearNow);
    const [month, setMonth] = useState(0);

    let startYear = 2021;
    const yearsArr = []
    while(startYear <= yearNow) {
        yearsArr.push(yearNow--)
    }
    const monthMap = ["All", "January", "Feburary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

    function getCr() {
        return props.stats["Food"] + props.stats["Grocery"] + props.stats["School"] + props.stats["Recreation"] + props.stats["Misc"] + props.stats["Housing"];
    }

    function getDr() {
        return props.stats["Earning"]
    }

    async function getStats(filter) {
        setYear(filter["year"])
        setMonth(filter["month"])
        await props.getStats(filter)
    }

    // useEffect(() => {getStats({"year": year, "month": month})}, [])

    return(
        <div className="Stats">

            {!props.loading ? 
                <div className="stat-row" style={{marginTop:"2rem"}}>
                    <select className="date-input" value={year} onChange={(e) => getStats({"year": e.target.value, "month": month})}>
                        {yearsArr.map((x, i) => 
                            <option key={i} value={x}>{x}</option>
                        )}
                    </select>
                    <select className="date-input" value={month} onChange={(e) => getStats({"year": year, "month": e.target.value})}>
                        {monthMap.map((x, i) => 
                            <option key={i} value={i}>{x}</option>
                        )}
                    </select>
                </div>  : ""
            }

            {!props.loading ? 
                <div className="stat-row">
                    <StatBox type="Food" value={-props.stats["Food"]}/>
                    <StatBox type="Grocery" value={-props.stats["Grocery"]}/>
                </div> : ""
            }
            {!props.loading ? 
                <div className="stat-row">
                    <StatBox type="School" value={-props.stats["School"]}/>
                    <StatBox type="Recreation" value={-props.stats["Recreation"]}/>
                </div> : ""
            }
            {!props.loading ? 
                <div className="stat-row">
                    <StatBox type="Misc" value={-props.stats["Misc"]}/>
                    <StatBox type="Housing" value={-props.stats["Housing"]}/>
                </div> : ""
            }
            {!props.loading ?
                // <div className="stat-row">
                //     <StatBox hideLabel={true} type="Earning" value={-getCR()}/>
                //     <StatBox hideLabel={true} neutralValue={true} type="Earning" value={getDR()-getCR()}/>
                // </div> : ""
                <div className="stat-row">
                    <StatEqn valueDr={getDr()} valueCr={-getCr()} />
                </div> : ""
            }

            {props.loading &&
                <div className="spinner-container">
                    <div className="loading-spinner"></div>
                </div>
            }
            
        </div>
    )
}