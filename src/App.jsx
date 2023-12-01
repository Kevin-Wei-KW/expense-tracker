import { useState, useEffect } from 'react'
import axios from "axios";
import './App.css'

import Page from "./components/Page.jsx"
import AddTxn from "./components/AddTxnBtn.jsx"
import NavBar from "./components/NavBar.jsx"


export default function App() {
  const [txnDataList, setTxnDataList] = useState([])
  const [loadingTxns, setLoadingTxns] = useState(false)

  const [statsDict, setStatsDict] = useState({})
  const [loadingStats, setLoadingStats] = useState(false)

  function getTxns() {
    setLoadingTxns(true)
    axios({
      method: "GET",
      url:"http://localhost:5000/txns",
    })
    .then((response) => {
      const res = response.data
      setLoadingTxns(false)
      setTxnDataList([...res])
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }

  function pushTxns(data) {
    axios.post(
      "http://localhost:5000/txns", data
    )
    .then(() => {
      getTxns()
      getStats()
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }

  function getStats(data = {"year": 2023, "month": 0}) {
    setLoadingStats(true)
    axios.get(
      "http://localhost:5000/stats", { params: {
        year: data["year"],
        month: data["month"],
      }}
    )
    .then((response) => {
      const res = response.data
      setLoadingStats(false)
      setStatsDict(res)
    })
    .catch((error) => {
      if (error.response) {
        console.log(error.response)
        console.log(error.response.status)
        console.log(error.response.headers)
      }
    })
  }


   useEffect(() => getTxns(), []);
   useEffect(() => getStats(), []);

  return (
    <div className="App">
      <Page
        txns={txnDataList}
        stats={statsDict}
        getTxns={getTxns}
        getStats={getStats}
        pushTxns={pushTxns} 
        loadingStats={loadingStats} 
        loadingTxns={loadingTxns}
      />

      {/* <header className="App-header">
        <img src={reactLogo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <p>To get your profile details: </p><button onClick={getTxns}>Click me</button>
        {txnData && <div>
              <p>Date: {txnData.date}</p>
              <p>Type: {txnData.txn}</p>
              <p>Details: {txnData.desc}</p>
              <p>DR: {txnData.dr}</p>
              <p>CR: {txnData.cr}</p>
            </div>
        }
      </header> */}
    </div>
  );
}
